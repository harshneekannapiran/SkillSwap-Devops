pipeline {
    agent any

    stages {

        stage('Build Docker Image') {
            steps {
                bat "docker build -t skillswap-app ."
            }
        }

        stage('Deploy') {
            steps {
                script {

                    // Detect branch from Jenkins config
                    def branch = env.GIT_BRANCH

                    if (branch.contains("dev")) {
                        bat "docker rm -f test-container || exit 0"
                        bat "docker run -d -p 3001:5000 --name test-container skillswap-app"
                    }

                    if (branch.contains("main")) {
                        bat "docker rm -f prod-container || exit 0"
                        bat "docker run -d -p 3002:5000 --name prod-container skillswap-app"
                    }

                }
            }
        }
    }
}