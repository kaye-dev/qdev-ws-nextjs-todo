import * as cdk from "aws-cdk-lib";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecr from "aws-cdk-lib/aws-ecr";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as elbv2 from "aws-cdk-lib/aws-elasticloadbalancingv2";
import * as iam from "aws-cdk-lib/aws-iam";
import * as logs from "aws-cdk-lib/aws-logs";
import { Construct } from "constructs";

export interface TodoAppStackProps extends cdk.StackProps {
  appName: string;
  deploymentEnvironment: string;
  participantName: string;
  containerPort?: number;
  desiredCount?: number;
  cpu?: number;
  memory?: number;
}

export class TodoAppStack extends cdk.Stack {
  // パブリックプロパティでリソースを公開
  public readonly appName: string;
  public readonly deploymentEnvironment: string;
  public readonly participantName: string;
  public readonly containerPort: number;
  public readonly desiredCount: number;
  public readonly cpu: number;
  public readonly memory: number;

  // ネットワークリソース
  public readonly vpc: ec2.IVpc;
  public readonly albSecurityGroup: ec2.SecurityGroup;
  public readonly ecsSecurityGroup: ec2.SecurityGroup;

  // ECRリソース（既存リポジトリを参照）
  public readonly ecrRepository: ecr.IRepository;
  public readonly ecsTaskExecutionRole: iam.Role;

  // ECSリソース
  public readonly ecsCluster: ecs.Cluster;
  public readonly taskDefinition: ecs.FargateTaskDefinition;
  public readonly logGroup: logs.LogGroup;
  public readonly ecsService: ecs.FargateService;

  // ALBリソース
  public readonly applicationLoadBalancer: elbv2.ApplicationLoadBalancer;
  public readonly targetGroup: elbv2.ApplicationTargetGroup;
  public readonly listener: elbv2.ApplicationListener;

  // CloudFrontリソース
  public readonly cloudFrontDistribution: cloudfront.Distribution;

  // DynamoDBリソース
  public readonly todoTable: dynamodb.Table;

  constructor(scope: Construct, id: string, props: TodoAppStackProps) {
    super(scope, id, props);

    // 入力パラメータのバリデーション
    this.validateProps(props);

    // プロパティの初期化（デフォルト値付き）
    this.appName = props.appName;
    this.deploymentEnvironment = props.deploymentEnvironment;
    this.participantName = props.participantName;
    this.containerPort = props.containerPort || 3000;
    this.desiredCount = props.desiredCount || 1;
    this.cpu = props.cpu || 256;
    this.memory = props.memory || 512;

    // ネットワーク構成の作成（VPC共有機能付き）
    this.vpc = this.createOrFindVpc();
    this.albSecurityGroup = this.createAlbSecurityGroup();
    this.ecsSecurityGroup = this.createEcsSecurityGroup();

    // 既存ECRリポジトリの参照
    const { repository, ecsTaskExecutionRole } =
      this.referenceExistingEcrRepository();
    this.ecrRepository = repository;
    this.ecsTaskExecutionRole = ecsTaskExecutionRole;

    // DynamoDBテーブルの作成（タスク定義作成前に必要）
    this.todoTable = this.createDynamoDbTable();

    // ECSクラスターとタスク定義の作成
    this.logGroup = this.createLogGroup();
    this.ecsCluster = this.createEcsCluster();
    this.taskDefinition = this.createTaskDefinition();

    // ALBの作成（ECSサービス作成前に必要）
    const { alb, targetGroup, listener } = this.createApplicationLoadBalancer();
    this.applicationLoadBalancer = alb;
    this.targetGroup = targetGroup;
    this.listener = listener;

    // ECSサービスの作成（ALB作成後）
    this.ecsService = this.createEcsService();

    // CloudFrontディストリビューションの作成（ALB作成後）
    this.cloudFrontDistribution = this.createCloudFrontDistribution();

    // 共通タグの設定
    this.addCommonTags();

    // スタック設定の出力
    this.addStackOutputs();
  }

  /**
   * プロパティのバリデーション
   */
  private validateProps(props: TodoAppStackProps): void {
    // アプリ名のバリデーション
    if (!props.appName || props.appName.trim() === "") {
      throw new Error("appNameは必須です。空の文字列は指定できません。");
    }

    if (props.appName.length > 50) {
      throw new Error("appNameは50文字以下で指定してください。");
    }

    if (!/^[a-zA-Z0-9-]+$/.test(props.appName)) {
      throw new Error("appNameは英数字とハイフンのみ使用できます。");
    }

    // 環境名のバリデーション
    const validEnvironments = ["development", "staging", "production", "test"];
    if (
      !props.deploymentEnvironment ||
      !validEnvironments.includes(props.deploymentEnvironment)
    ) {
      throw new Error(
        `deploymentEnvironmentは次のいずれかを指定してください: ${validEnvironments.join(
          ", "
        )}`
      );
    }

    // オプションパラメータのバリデーション
    if (
      props.containerPort &&
      (props.containerPort < 1 || props.containerPort > 65535)
    ) {
      throw new Error("containerPortは1から65535の範囲で指定してください。");
    }

    if (
      props.desiredCount &&
      (props.desiredCount < 1 || props.desiredCount > 10)
    ) {
      throw new Error("desiredCountは1から10の範囲で指定してください。");
    }

    if (props.cpu && ![256, 512, 1024, 2048, 4096].includes(props.cpu)) {
      throw new Error(
        "cpuは256, 512, 1024, 2048, 4096のいずれかを指定してください。"
      );
    }

    if (props.memory && (props.memory < 512 || props.memory > 30720)) {
      throw new Error("memoryは512から30720の範囲で指定してください。");
    }

    // CPUとメモリの組み合わせバリデーション
    if (props.cpu && props.memory) {
      const validCombinations = [
        { cpu: 256, memory: [512, 1024, 2048] },
        { cpu: 512, memory: [1024, 2048, 3072, 4096] },
        { cpu: 1024, memory: [2048, 3072, 4096, 5120, 6144, 7168, 8192] },
        {
          cpu: 2048,
          memory: [
            4096, 5120, 6144, 7168, 8192, 9216, 10240, 11264, 12288, 13312,
            14336, 15360, 16384,
          ],
        },
        {
          cpu: 4096,
          memory: [
            8192, 9216, 10240, 11264, 12288, 13312, 14336, 15360, 16384, 17408,
            18432, 19456, 20480, 21504, 22528, 23552, 24576, 25600, 26624,
            27648, 28672, 29696, 30720,
          ],
        },
      ];

      const validCombination = validCombinations.find(
        (combo) => combo.cpu === props.cpu
      );
      if (
        !validCombination ||
        !validCombination.memory.includes(props.memory)
      ) {
        throw new Error(
          `CPU ${props.cpu}に対してメモリ ${props.memory}は無効な組み合わせです。有効な組み合わせを確認してください。`
        );
      }
    }
  }

  /**
   * 共通タグを追加
   */
  private addCommonTags(): void {
    const tags = {
      Application: this.appName,
      ManagedBy: "CDK",
      Project: "NextJS-Todo-App",
      Owner: "Development-Team",
      CostCenter: this.appName,
      CreatedBy: "AWS-CDK",
    };

    Object.entries(tags).forEach(([key, value]) => {
      cdk.Tags.of(this).add(key, value);
    });
  }

  /**
   * VPCを作成または既存のVPCを検索
   * ワークショップでのVPC共有のため、コンテキストで制御
   */
  private createOrFindVpc(): ec2.IVpc {
    // VPC制限のため、常に既定のVPCを使用
    console.log(`既定のVPCを使用します（参加者: ${this.participantName}）`);
    const vpc = ec2.Vpc.fromLookup(this, "DefaultVpc", {
      isDefault: true,
    });
    return vpc;
  }

  /**
   * ALB用セキュリティグループを作成
   */
  private createAlbSecurityGroup(): ec2.SecurityGroup {
    const securityGroup = new ec2.SecurityGroup(this, "AlbSecurityGroup", {
      vpc: this.vpc,
      securityGroupName: `${this.appName}-${this.participantName}-alb-sg`,
      description: "Security group for Application Load Balancer",
      allowAllOutbound: true,
    });

    // HTTP (80) トラフィックを許可
    securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(80),
      "HTTP traffic from anywhere"
    );

    // HTTPS (443) トラフィックを許可（将来の拡張用）
    securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(443),
      "HTTPS traffic from anywhere"
    );

    cdk.Tags.of(securityGroup).add(
      "Name",
      `${this.appName}-${this.participantName}-alb-sg`
    );

    return securityGroup;
  }

  /**
   * ECS用セキュリティグループを作成
   */
  private createEcsSecurityGroup(): ec2.SecurityGroup {
    const securityGroup = new ec2.SecurityGroup(this, "EcsSecurityGroup", {
      vpc: this.vpc,
      securityGroupName: `${this.appName}-${this.participantName}-${this.deploymentEnvironment}-ecs-sg`,
      description: "Security group for ECS Fargate tasks",
      allowAllOutbound: true,
    });

    // ALBからのトラフィックのみ許可（ALBセキュリティグループが既に作成されている前提）
    securityGroup.addIngressRule(
      this.albSecurityGroup,
      ec2.Port.tcp(this.containerPort),
      `Traffic from ALB on port ${this.containerPort}`
    );

    cdk.Tags.of(securityGroup).add(
      "Name",
      `${this.appName}-${this.participantName}-${this.deploymentEnvironment}-ecs-sg`
    );

    return securityGroup;
  }