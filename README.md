# Resolving Dependency Deadlock

## Prerequisites
- Configured AWS account credentials ([AWS CLI Configuration](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html))
- Installed Node.js ([Node.js Installation](https://nodejs.org/))

## Setup

1. **Install package dependencies:**
    ```bash
    npm install
    ```

2. **Bootstrap your AWS account:**
    ```bash
    npm run cdk bootstrap
    ```

3. **Deploy the initial version of two stacks with cross-stack references:**
    ```bash
    npm run cdk -- --app 'npx ts-node bin/myapp-1-cross-stack-references.ts' deploy '*'
    ```

4. **Deploy the second version of stacks where we attempt to rename the lambda function. This deployment is expected to fail:**
    ```bash
    npm run cdk -- --app 'npx ts-node bin/myapp-2-rename-lambda-func.ts' deploy '*'
    ```

5. **Deploy the first part of refactored stacks, which removes cross-stack references:**
    ```bash
    npm run cdk -- --app 'npx ts-node bin/myapp-3-1-break-stacks-relationships.ts' deploy '*'
    ```

6. **Deploy the second part of refactored stacks, which successfully renames the lambda function:**
    ```bash
    npm run cdk -- --app 'npx ts-node bin/myapp-3-2-rename-lambda-func.ts' deploy '*'
    ```
