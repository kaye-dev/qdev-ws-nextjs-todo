import { CloudFormationClient, DescribeStacksCommand } from '@aws-sdk/client-cloudformation';
import { writeFileSync } from 'fs';
import { join } from 'path';

const STACK_NAME = 'TodoAppStack';
const ENV_FILE_PATH = join(process.cwd(), '.env.local');

async function setupLocalEnv() {
  try {
    const cfClient = new CloudFormationClient({ region: 'ap-northeast-1' });
    
    const command = new DescribeStacksCommand({
      StackName: STACK_NAME,
    });
    
    const response = await cfClient.send(command);
    const stack = response.Stacks?.[0];
    
    if (!stack?.Outputs) {
      throw new Error('Stack outputs not found');
    }
    
    const outputs = stack.Outputs.reduce((acc, output) => {
      if (output.OutputKey && output.OutputValue) {
        acc[output.OutputKey] = output.OutputValue;
      }
      return acc;
    }, {} as Record<string, string>);
    
    const envContent = `# Auto-generated from CDK stack outputs
AWS_REGION=ap-northeast-1
DYNAMODB_TABLE_NAME=${outputs.DynamoDbTableName || 'TodoTable'}
NOTIFICATION_TABLE_NAME=${outputs.NotificationTableName || 'NotificationSettings'}
SNS_TOPIC_ARN=${outputs.SnsTopicArn || ''}
`;
    
    writeFileSync(ENV_FILE_PATH, envContent);
    console.log('✅ Local environment variables updated from CDK stack');
    console.log(`📝 Updated: ${ENV_FILE_PATH}`);
    
  } catch (error) {
    console.error('❌ Failed to setup local environment:', error);
    process.exit(1);
  }
}

setupLocalEnv();