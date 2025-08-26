import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as sns from 'aws-cdk-lib/aws-sns';
import { Construct } from 'constructs';

export interface TodoAppStackProps extends cdk.StackProps {
  appName: string;
  deploymentEnvironment: string;
  containerPort?: number;
  desiredCount?: number;
  cpu?: number;
  memory?: number;
}

export class TodoAppStack extends cdk.Stack {
  // パブリックプロパティでリソースを公開
  public readonly appName: string;
  public readonly deploymentEnvironment: string;
  public readonly containerPort: number;
  public readonly desiredCount: number;
  public readonly cpu: number;
  public readonly memory: number;

  // ネットワークリソース
  public readonly vpc: ec2.Vpc;
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

  // DynamoDBリソース
  public readonly todoTable: dynamodb.Table;
  public readonly notificationTable: dynamodb.Table;

  // SNSリソース
  public readonly snsTopicArn: string;

  constructor(scope: Construct, id: string, props: TodoAppStackProps) {
    super(scope, id, props);

    // 入力パラメータのバリデーション
    this.validateProps(props);

    // プロパティの初期化（デフォルト値付き）
    this.appName = props.appName;
    this.deploymentEnvironment = props.deploymentEnvironment;
    this.containerPort = props.containerPort || 3000;
    this.desiredCount = props.desiredCount || 1;
    this.cpu = props.cpu || 256;
    this.memory = props.memory || 512;

    // ネットワーク構成の作成
    this.vpc = this.createVpc();
    this.albSecurityGroup = this.createAlbSecurityGroup();
    this.ecsSecurityGroup = this.createEcsSecurityGroup();

    // 既存ECRリポジトリの参照
    const { repository, ecsTaskExecutionRole } = this.referenceExistingEcrRepository();
    this.ecrRepository = repository;
    this.ecsTaskExecutionRole = ecsTaskExecutionRole;

    // DynamoDBテーブルの作成（タスク定義作成前に必要）
    this.todoTable = this.createDynamoDbTable();
    this.notificationTable = this.createNotificationTable();

    // SNSトピックの作成
    this.snsTopicArn = this.createSnsResources();

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
    if (!props.appName || props.appName.trim() === '') {
      throw new Error('appNameは必須です。空の文字列は指定できません。');
    }

    if (props.appName.length > 50) {
      throw new Error('appNameは50文字以下で指定してください。');
    }

    if (!/^[a-zA-Z0-9-]+$/.test(props.appName)) {
      throw new Error('appNameは英数字とハイフンのみ使用できます。');
    }

    // 環境名のバリデーション
    const validEnvironments = ['development', 'staging', 'production', 'test'];
    if (!props.deploymentEnvironment || !validEnvironments.includes(props.deploymentEnvironment)) {
      throw new Error(`deploymentEnvironmentは次のいずれかを指定してください: ${validEnvironments.join(', ')}`);
    }

    // オプションパラメータのバリデーション
    if (props.containerPort && (props.containerPort < 1 || props.containerPort > 65535)) {
      throw new Error('containerPortは1から65535の範囲で指定してください。');
    }

    if (props.desiredCount && (props.desiredCount < 1 || props.desiredCount > 10)) {
      throw new Error('desiredCountは1から10の範囲で指定してください。');
    }

    if (props.cpu && ![256, 512, 1024, 2048, 4096].includes(props.cpu)) {
      throw new Error('cpuは256, 512, 1024, 2048, 4096のいずれかを指定してください。');
    }

    if (props.memory && (props.memory < 512 || props.memory > 30720)) {
      throw new Error('memoryは512から30720の範囲で指定してください。');
    }

    // CPUとメモリの組み合わせバリデーション
    if (props.cpu && props.memory) {
      const validCombinations = [
        { cpu: 256, memory: [512, 1024, 2048] },
        { cpu: 512, memory: [1024, 2048, 3072, 4096] },
        { cpu: 1024, memory: [2048, 3072, 4096, 5120, 6144, 7168, 8192] },
        { cpu: 2048, memory: [4096, 5120, 6144, 7168, 8192, 9216, 10240, 11264, 12288, 13312, 14336, 15360, 16384] },
        { cpu: 4096, memory: [8192, 9216, 10240, 11264, 12288, 13312, 14336, 15360, 16384, 17408, 18432, 19456, 20480, 21504, 22528, 23552, 24576, 25600, 26624, 27648, 28672, 29696, 30720] }
      ];

      const validCombination = validCombinations.find(combo => combo.cpu === props.cpu);
      if (!validCombination || !validCombination.memory.includes(props.memory)) {
        throw new Error(`CPU ${props.cpu}に対してメモリ ${props.memory}は無効な組み合わせです。有効な組み合わせを確認してください。`);
      }
    }
  }

  /**
   * 共通タグを追加
   */
  private addCommonTags(): void {
    const tags = {
      'Application': this.appName,
      'ManagedBy': 'CDK',
      'Project': 'NextJS-Todo-App',
      'Owner': 'Development-Team',
      'CostCenter': this.appName,
      'CreatedBy': 'AWS-CDK'
    };

    Object.entries(tags).forEach(([key, value]) => {
      cdk.Tags.of(this).add(key, value);
    });
  }

  /**
   * VPCを作成
   */
  private createVpc(): ec2.Vpc {
    const vpc = new ec2.Vpc(this, 'TodoAppVpc', {
      vpcName: `${this.appName}-vpc`,
      ipAddresses: ec2.IpAddresses.cidr('10.0.0.0/16'),
      maxAzs: 2, // 2つのアベイラビリティゾーンを使用
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'PublicSubnet',
          subnetType: ec2.SubnetType.PUBLIC,
        }
      ],
      // インターネットゲートウェイを自動作成
      natGateways: 0, // NATゲートウェイは不要（パブリックサブネットのみ）
      enableDnsHostnames: true,
      enableDnsSupport: true,
    });

    // VPCにタグを追加
    cdk.Tags.of(vpc).add('Name', `${this.appName}-vpc`);

    return vpc;
  }

  /**
   * ALB用セキュリティグループを作成
   */
  private createAlbSecurityGroup(): ec2.SecurityGroup {
    const securityGroup = new ec2.SecurityGroup(this, 'AlbSecurityGroup', {
      vpc: this.vpc,
      securityGroupName: `${this.appName}-alb-sg`,
      description: 'Security group for Application Load Balancer',
      allowAllOutbound: true,
    });

    // HTTP (80) トラフィックを許可
    securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(80),
      'HTTP traffic from anywhere'
    );

    // HTTPS (443) トラフィックを許可（将来の拡張用）
    securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(443),
      'HTTPS traffic from anywhere'
    );

    cdk.Tags.of(securityGroup).add('Name', `${this.appName}-alb-sg`);

    return securityGroup;
  }

  /**
   * ECS用セキュリティグループを作成
   */
  private createEcsSecurityGroup(): ec2.SecurityGroup {
    const securityGroup = new ec2.SecurityGroup(this, 'EcsSecurityGroup', {
      vpc: this.vpc,
      securityGroupName: `${this.appName}-${this.deploymentEnvironment}-ecs-sg`,
      description: 'Security group for ECS Fargate tasks',
      allowAllOutbound: true,
    });

    // ALBからのトラフィックのみ許可（ALBセキュリティグループが既に作成されている前提）
    securityGroup.addIngressRule(
      this.albSecurityGroup,
      ec2.Port.tcp(this.containerPort),
      `Traffic from ALB on port ${this.containerPort}`
    );

    cdk.Tags.of(securityGroup).add('Name', `${this.appName}-${this.deploymentEnvironment}-ecs-sg`);

    return securityGroup;
  }

  /**
   * 既存ECRリポジトリを参照
   */
  private referenceExistingEcrRepository(): { repository: ecr.IRepository; ecsTaskExecutionRole: iam.Role } {
    // 既存ECRリポジトリを参照（デプロイメントスクリプトで作成済み）
    const repository = ecr.Repository.fromRepositoryName(
      this,
      'TodoAppRepository',
      this.appName
    );

    // ECRアクセス権限の設定
    const ecsTaskExecutionRole = this.setupEcrPermissions(repository);

    return { repository, ecsTaskExecutionRole };
  }

  /**
   * ECRアクセス権限を設定
   */
  private setupEcrPermissions(repository: ecr.IRepository): iam.Role {
    // ECSタスク実行ロール用の権限
    const ecsTaskExecutionRole = new iam.Role(this, 'EcsTaskExecutionRole', {
      roleName: `${this.appName}-ecs-task-execution-role`,
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
      description: 'ECS Fargate task execution IAM role',
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonECSTaskExecutionRolePolicy'),
      ],
    });

    // ECRからのイメージプル権限を付与
    repository.grantPull(ecsTaskExecutionRole);

    // CloudWatch Logs権限を追加
    ecsTaskExecutionRole.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'logs:CreateLogGroup',
        'logs:CreateLogStream',
        'logs:PutLogEvents',
        'logs:DescribeLogStreams'
      ],
      resources: [
        `arn:aws:logs:${this.region}:${this.account}:log-group:/ecs/${this.appName}-${this.deploymentEnvironment}*`
      ]
    }));

    // ロールにタグを追加
    cdk.Tags.of(ecsTaskExecutionRole).add('Name', `${this.appName}-ecs-task-execution-role`);

    return ecsTaskExecutionRole;
  }

  /**
   * CloudWatch LogGroupを作成
   */
  private createLogGroup(): logs.LogGroup {
    const logGroup = new logs.LogGroup(this, 'TodoAppLogGroup', {
      logGroupName: `/ecs/${this.appName}-${this.deploymentEnvironment}`,
      retention: this.deploymentEnvironment === 'production'
        ? logs.RetentionDays.ONE_MONTH
        : logs.RetentionDays.ONE_WEEK,
      removalPolicy: this.deploymentEnvironment === 'production'
        ? cdk.RemovalPolicy.RETAIN
        : cdk.RemovalPolicy.DESTROY,
    });

    cdk.Tags.of(logGroup).add('Name', `${this.appName}-${this.deploymentEnvironment}-logs`);

    return logGroup;
  }

  /**
   * ECS Fargateクラスターを作成
   */
  private createEcsCluster(): ecs.Cluster {
    const cluster = new ecs.Cluster(this, 'TodoAppCluster', {
      clusterName: `${this.appName}-${this.deploymentEnvironment}-cluster`,
      vpc: this.vpc,
      // Container Insightsを有効化（本番環境のみ）
      containerInsights: this.deploymentEnvironment === 'production',
    });

    cdk.Tags.of(cluster).add('Name', `${this.appName}-${this.deploymentEnvironment}-cluster`);

    return cluster;
  }

  /**
   * Fargateタスク定義を作成
   */
  private createTaskDefinition(): ecs.FargateTaskDefinition {
    const taskDefinition = new ecs.FargateTaskDefinition(this, 'TodoAppTaskDefinition', {
      family: `${this.appName}-${this.deploymentEnvironment}-task`,
      cpu: this.cpu,
      memoryLimitMiB: this.memory,
      executionRole: this.ecsTaskExecutionRole,
      // タスクロールは基本的な権限のみ（必要に応じて後で拡張）
      taskRole: this.createTaskRole(),
    });

    // コンテナ定義を追加
    taskDefinition.addContainer('TodoAppContainer', {
      containerName: `${this.appName}-${this.deploymentEnvironment}-container`,
      image: ecs.ContainerImage.fromEcrRepository(this.ecrRepository, 'latest'),
      // ポートマッピング
      portMappings: [
        {
          containerPort: this.containerPort,
          protocol: ecs.Protocol.TCP,
        }
      ],
      // ログ設定
      logging: ecs.LogDrivers.awsLogs({
        streamPrefix: 'ecs',
        logGroup: this.logGroup,
      }),
      // 環境変数
      environment: {
        NODE_ENV: 'production',
        PORT: this.containerPort.toString(),
        NEXT_TELEMETRY_DISABLED: '1',
        AWS_REGION: this.region,
        DYNAMODB_TABLE_NAME: this.todoTable.tableName,
        NOTIFICATION_TABLE_NAME: this.notificationTable.tableName,
        SNS_TOPIC_ARN: this.snsTopicArn,
        // CDK Watchでの開発用
        CDK_WATCH_MODE: process.env.CDK_WATCH_MODE || 'false',
      },
      // ヘルスチェック設定
      healthCheck: {
        command: [
          'CMD-SHELL',
          `curl -f http://localhost:${this.containerPort}/api/health || exit 1`
        ],
        interval: cdk.Duration.seconds(30),
        timeout: cdk.Duration.seconds(5),
        retries: 3,
        startPeriod: cdk.Duration.seconds(60),
      },
      // リソース制限
      essential: true,
    });

    cdk.Tags.of(taskDefinition).add('Name', `${this.appName}-${this.deploymentEnvironment}-task`);

    return taskDefinition;
  }

  /**
   * ECSタスク用のIAMロールを作成
   */
  private createTaskRole(): iam.Role {
    const taskRole = new iam.Role(this, 'EcsTaskRole', {
      roleName: `${this.appName}-${this.deploymentEnvironment}-ecs-task-role`,
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
      description: 'IAM role for ECS Fargate tasks',
    });

    // 基本的なCloudWatch Logs権限を追加
    taskRole.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'logs:CreateLogStream',
        'logs:PutLogEvents'
      ],
      resources: [
        this.logGroup.logGroupArn,
        `${this.logGroup.logGroupArn}:*`
      ]
    }));

    // Execute Command用の権限を追加
    taskRole.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'ssmmessages:CreateControlChannel',
        'ssmmessages:CreateDataChannel',
        'ssmmessages:OpenControlChannel',
        'ssmmessages:OpenDataChannel'
      ],
      resources: ['*']
    }));

    // DynamoDBテーブルへのアクセス権限を追加
    this.todoTable.grantReadWriteData(taskRole);
    this.notificationTable.grantReadWriteData(taskRole);

    // SNSへのアクセス権限を追加
    taskRole.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'sns:Publish',
        'sns:Subscribe',
        'sns:Unsubscribe',
        'sns:ListSubscriptionsByTopic'
      ],
      resources: [this.snsTopicArn]
    }));

    cdk.Tags.of(taskRole).add('Name', `${this.appName}-${this.deploymentEnvironment}-ecs-task-role`);

    return taskRole;
  }

  /**
   * Application Load Balancerを作成
   */
  private createApplicationLoadBalancer(): {
    alb: elbv2.ApplicationLoadBalancer;
    targetGroup: elbv2.ApplicationTargetGroup;
    listener: elbv2.ApplicationListener;
  } {
    // Application Load Balancerの作成
    const alb = new elbv2.ApplicationLoadBalancer(this, 'TodoAppLoadBalancer', {
      loadBalancerName: `${this.appName}-${this.deploymentEnvironment}-alb`,
      vpc: this.vpc,
      internetFacing: true, // インターネット向け
      securityGroup: this.albSecurityGroup,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
      // 削除保護（本番環境のみ）
      deletionProtection: this.deploymentEnvironment === 'production',
    });

    // ターゲットグループの作成
    const targetGroup = new elbv2.ApplicationTargetGroup(this, 'TodoAppTargetGroup', {
      targetGroupName: `${this.appName}-${this.deploymentEnvironment}-tg`,
      port: this.containerPort,
      protocol: elbv2.ApplicationProtocol.HTTP,
      vpc: this.vpc,
      targetType: elbv2.TargetType.IP, // Fargateの場合はIPターゲット
      // ヘルスチェック設定
      healthCheck: {
        enabled: true,
        path: '/api/health', // 専用ヘルスチェックエンドポイント
        protocol: elbv2.Protocol.HTTP,
        port: 'traffic-port',
        healthyHttpCodes: '200',
        interval: cdk.Duration.seconds(30),
        timeout: cdk.Duration.seconds(5),
        healthyThresholdCount: 2,
        unhealthyThresholdCount: 3,
      },
      // ターゲット登録解除の遅延時間
      deregistrationDelay: cdk.Duration.seconds(30),
    });

    // リスナーの作成
    const listener = alb.addListener('TodoAppListener', {
      port: 80,
      protocol: elbv2.ApplicationProtocol.HTTP,
      // デフォルトアクション
      defaultAction: elbv2.ListenerAction.forward([targetGroup]),
    });

    // タグの追加
    cdk.Tags.of(alb).add('Name', `${this.appName}-${this.deploymentEnvironment}-alb`);
    cdk.Tags.of(targetGroup).add('Name', `${this.appName}-${this.deploymentEnvironment}-tg`);

    return { alb, targetGroup, listener };
  }

  /**
   * ECS Fargateサービスを作成
   */
  private createEcsService(): ecs.FargateService {
    const service = new ecs.FargateService(this, 'TodoAppService', {
      serviceName: `${this.appName}-${this.deploymentEnvironment}-service`,
      cluster: this.ecsCluster,
      taskDefinition: this.taskDefinition,
      desiredCount: this.desiredCount,
      // パブリックサブネットに配置（ワークショップ用のシンプル構成）
      assignPublicIp: true,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
      securityGroups: [this.ecsSecurityGroup],
      // ヘルスチェック猶予期間（ALBヘルスチェックのため）
      healthCheckGracePeriod: cdk.Duration.seconds(60),
      // プラットフォームバージョン
      platformVersion: ecs.FargatePlatformVersion.LATEST,
      // デバッグ用にExecute Commandを有効化
      enableExecuteCommand: true,
    });

    // ECSサービスをALBのターゲットグループに登録
    this.targetGroup.addTarget(service.loadBalancerTarget({
      containerName: `${this.appName}-${this.deploymentEnvironment}-container`,
      containerPort: this.containerPort,
    }));

    // サービスのオートスケーリング設定（本番環境のみ）
    if (this.deploymentEnvironment === 'production') {
      const scaling = service.autoScaleTaskCount({
        minCapacity: this.desiredCount,
        maxCapacity: this.desiredCount * 3, // 最大3倍まで
      });

      // CPU使用率ベースのスケーリング
      scaling.scaleOnCpuUtilization('CpuScaling', {
        targetUtilizationPercent: 70,
        scaleInCooldown: cdk.Duration.minutes(5),
        scaleOutCooldown: cdk.Duration.minutes(2),
      });

      // メモリ使用率ベースのスケーリング
      scaling.scaleOnMemoryUtilization('MemoryScaling', {
        targetUtilizationPercent: 80,
        scaleInCooldown: cdk.Duration.minutes(5),
        scaleOutCooldown: cdk.Duration.minutes(2),
      });
    }

    cdk.Tags.of(service).add('Name', `${this.appName}-${this.deploymentEnvironment}-service`);

    return service;
  }

  /**
   * DynamoDBテーブルを作成
   */
  private createDynamoDbTable(): dynamodb.Table {
    const table = new dynamodb.Table(this, 'TodoTable', {
      tableName: 'TodoTable',
      partitionKey: {
        name: 'id',
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: this.deploymentEnvironment === 'production'
        ? cdk.RemovalPolicy.RETAIN
        : cdk.RemovalPolicy.DESTROY,
      pointInTimeRecovery: this.deploymentEnvironment === 'production',
    });

    cdk.Tags.of(table).add('Name', `${this.appName}-${this.deploymentEnvironment}-todo-table`);

    return table;
  }

  /**
   * 通知設定DynamoDBテーブルを作成
   */
  private createNotificationTable(): dynamodb.Table {
    const table = new dynamodb.Table(this, 'NotificationTable', {
      tableName: 'NotificationSettings',
      partitionKey: {
        name: 'id',
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: this.deploymentEnvironment === 'production'
        ? cdk.RemovalPolicy.RETAIN
        : cdk.RemovalPolicy.DESTROY,
      pointInTimeRecovery: this.deploymentEnvironment === 'production',
    });

    cdk.Tags.of(table).add('Name', `${this.appName}-${this.deploymentEnvironment}-notification-table`);

    return table;
  }

  /**
   * SNSリソースを作成
   */
  private createSnsResources(): string {
    const topic = new sns.Topic(this, 'TodoNotificationTopic', {
      topicName: `${this.appName}-${this.deploymentEnvironment}-todo-notifications`,
      displayName: 'Todo App Notifications',
    });

    cdk.Tags.of(topic).add('Name', `${this.appName}-${this.deploymentEnvironment}-sns-topic`);

    return topic.topicArn;
  }

  /**
   * スタック設定の出力
   */
  private addStackOutputs(): void {
    new cdk.CfnOutput(this, 'StackName', {
      value: this.stackName,
      description: 'CDKスタック名'
    });

    new cdk.CfnOutput(this, 'Environment', {
      value: this.deploymentEnvironment,
      description: 'デプロイメント環境'
    });

    new cdk.CfnOutput(this, 'ApplicationName', {
      value: this.appName,
      description: 'アプリケーション名'
    });

    new cdk.CfnOutput(this, 'Region', {
      value: this.region,
      description: 'デプロイメントリージョン'
    });

    new cdk.CfnOutput(this, 'VpcId', {
      value: this.vpc.vpcId,
      description: 'VPC ID'
    });

    new cdk.CfnOutput(this, 'PublicSubnetIds', {
      value: this.vpc.publicSubnets.map(subnet => subnet.subnetId).join(','),
      description: 'パブリックサブネット ID一覧'
    });

    new cdk.CfnOutput(this, 'AlbSecurityGroupId', {
      value: this.albSecurityGroup.securityGroupId,
      description: 'ALB セキュリティグループ ID'
    });

    new cdk.CfnOutput(this, 'EcsSecurityGroupId', {
      value: this.ecsSecurityGroup.securityGroupId,
      description: 'ECS セキュリティグループ ID'
    });

    new cdk.CfnOutput(this, 'ContainerConfiguration', {
      value: JSON.stringify({
        port: this.containerPort,
        desiredCount: this.desiredCount,
        cpu: this.cpu,
        memory: this.memory
      }),
      description: 'コンテナ設定情報'
    });

    // ECRリポジトリ関連の出力（参照のみ）
    new cdk.CfnOutput(this, 'EcrRepositoryName', {
      value: this.ecrRepository.repositoryName,
      description: 'ECRリポジトリ名（外部管理）',
      exportName: `${this.stackName}-EcrRepositoryName`
    });

    // IAMロール関連の出力
    new cdk.CfnOutput(this, 'EcsTaskExecutionRoleArn', {
      value: this.ecsTaskExecutionRole.roleArn,
      description: 'ECSタスク実行ロールARN',
      exportName: `${this.stackName}-EcsTaskExecutionRoleArn`
    });



    // ECS関連の出力
    new cdk.CfnOutput(this, 'EcsClusterName', {
      value: this.ecsCluster.clusterName,
      description: 'ECSクラスター名',
      exportName: `${this.stackName}-EcsClusterName`
    });

    new cdk.CfnOutput(this, 'EcsClusterArn', {
      value: this.ecsCluster.clusterArn,
      description: 'ECSクラスターARN'
    });

    new cdk.CfnOutput(this, 'TaskDefinitionArn', {
      value: this.taskDefinition.taskDefinitionArn,
      description: 'ECSタスク定義ARN',
      exportName: `${this.stackName}-TaskDefinitionArn`
    });

    new cdk.CfnOutput(this, 'TaskDefinitionFamily', {
      value: this.taskDefinition.family,
      description: 'ECSタスク定義ファミリー名'
    });

    new cdk.CfnOutput(this, 'LogGroupName', {
      value: this.logGroup.logGroupName,
      description: 'CloudWatch LogGroup名',
      exportName: `${this.stackName}-LogGroupName`
    });

    new cdk.CfnOutput(this, 'LogGroupArn', {
      value: this.logGroup.logGroupArn,
      description: 'CloudWatch LogGroup ARN'
    });

    new cdk.CfnOutput(this, 'EcsServiceName', {
      value: this.ecsService.serviceName,
      description: 'ECSサービス名',
      exportName: `${this.stackName}-EcsServiceName`
    });

    new cdk.CfnOutput(this, 'EcsServiceArn', {
      value: this.ecsService.serviceArn,
      description: 'ECSサービスARN'
    });

    new cdk.CfnOutput(this, 'ServiceConfiguration', {
      value: JSON.stringify({
        serviceName: this.ecsService.serviceName,
        desiredCount: this.desiredCount,
        platformVersion: 'LATEST',
        assignPublicIp: true
      }),
      description: 'ECSサービス設定情報'
    });

    // ALB関連の出力
    new cdk.CfnOutput(this, 'ApplicationLoadBalancerDnsName', {
      value: this.applicationLoadBalancer.loadBalancerDnsName,
      description: 'Application Load Balancer DNS名',
      exportName: `${this.stackName}-AlbDnsName`
    });

    new cdk.CfnOutput(this, 'ApplicationLoadBalancerArn', {
      value: this.applicationLoadBalancer.loadBalancerArn,
      description: 'Application Load Balancer ARN'
    });

    new cdk.CfnOutput(this, 'ApplicationUrl', {
      value: `http://${this.applicationLoadBalancer.loadBalancerDnsName}`,
      description: 'アプリケーションURL（HTTP）',
      exportName: `${this.stackName}-ApplicationUrl`
    });

    new cdk.CfnOutput(this, 'TargetGroupArn', {
      value: this.targetGroup.targetGroupArn,
      description: 'ターゲットグループARN',
      exportName: `${this.stackName}-TargetGroupArn`
    });

    new cdk.CfnOutput(this, 'TargetGroupName', {
      value: this.targetGroup.targetGroupName,
      description: 'ターゲットグループ名'
    });

    new cdk.CfnOutput(this, 'ListenerArn', {
      value: this.listener.listenerArn,
      description: 'ALBリスナーARN'
    });

    new cdk.CfnOutput(this, 'LoadBalancerConfiguration', {
      value: JSON.stringify({
        dnsName: this.applicationLoadBalancer.loadBalancerDnsName,
        scheme: 'internet-facing',
        type: 'application',
        port: 80,
        protocol: 'HTTP'
      }),
      description: 'ロードバランサー設定情報'
    });

    // DynamoDB関連の出力
    new cdk.CfnOutput(this, 'DynamoDbTableName', {
      value: this.todoTable.tableName,
      description: 'DynamoDB テーブル名',
      exportName: `${this.stackName}-DynamoDbTableName`
    });

    new cdk.CfnOutput(this, 'DynamoDbTableArn', {
      value: this.todoTable.tableArn,
      description: 'DynamoDB テーブル ARN'
    });

    new cdk.CfnOutput(this, 'NotificationTableName', {
      value: this.notificationTable.tableName,
      description: '通知設定テーブル名',
      exportName: `${this.stackName}-NotificationTableName`
    });

    new cdk.CfnOutput(this, 'NotificationTableArn', {
      value: this.notificationTable.tableArn,
      description: '通知設定テーブル ARN'
    });

    // SNS関連の出力
    new cdk.CfnOutput(this, 'SnsTopicArn', {
      value: this.snsTopicArn,
      description: 'SNSトピックARN',
      exportName: `${this.stackName}-SnsTopicArn`
    });
  }
}
