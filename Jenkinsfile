pipeline {
    agent any

    environment {
        IMAGE_NAME = "skillswap-app"
    }

    stages {

        stage('Clone') {
            steps {
                git branch: 'main', url: 'https://github.com/harshneekannapiran/SkillSwap-Devops.git'
            }
        }

        stage('Build') {
            steps {
                bat 'docker build -t skillswap-app:dev .'
            }
        }

        stage('Remove Old Container') {
            steps {
                bat 'docker rm -f test-container || exit 0'
            }
        }

        stage('Run Container') {
            steps {
                bat 'docker run -d -p 3001:5000 --name test-container skillswap-app:dev'
            }
        }
    }
}