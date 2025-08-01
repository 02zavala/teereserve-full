# TeeReserve Fase 5 - Guía de Deployment
## Deployment Guide Completo para Producción

### 🎯 **OVERVIEW**

Esta guía proporciona instrucciones detalladas para el deployment de TeeReserve Fase 5 en entornos de producción, incluyendo configuración de infraestructura, servicios, monitoreo y mantenimiento.

TeeReserve Fase 5 es una aplicación distribuida que requiere múltiples componentes trabajando en conjunto para proporcionar la experiencia completa de Enterprise Intelligence & Ecosistema Completo.

---

## 🏗️ **ARQUITECTURA DE DEPLOYMENT**

### **Componentes Principales**

```mermaid
graph TB
    subgraph "Load Balancer Layer"
        LB[Load Balancer]
        WAF[Web Application Firewall]
    end
    
    subgraph "Application Layer"
        API[API Gateway]
        WEB[Web Application]
        ML[ML Services]
        IOT[IoT Gateway]
        BC[Blockchain Services]
        AR[AR/VR Services]
    end
    
    subgraph "Data Layer"
        PG[(PostgreSQL)]
        REDIS[(Redis Cluster)]
        MONGO[(MongoDB)]
        INFLUX[(InfluxDB)]
    end
    
    subgraph "Infrastructure"
        K8S[Kubernetes Cluster]
        MONITORING[Monitoring Stack]
        LOGGING[Logging Stack]
    end
    
    LB --> API
    WAF --> LB
    API --> ML
    API --> IOT
    API --> BC
    API --> AR
    ML --> PG
    IOT --> INFLUX
    BC --> MONGO
    AR --> REDIS
```

### **Requisitos de Infraestructura**

#### **Minimum Requirements (Development)**
- **CPU:** 8 cores
- **RAM:** 32GB
- **Storage:** 500GB SSD
- **Network:** 1Gbps
- **OS:** Ubuntu 22.04 LTS

#### **Recommended Requirements (Production)**
- **CPU:** 32+ cores per node
- **RAM:** 128GB+ per node
- **Storage:** 2TB+ NVMe SSD
- **Network:** 10Gbps+ bandwidth
- **OS:** Ubuntu 22.04 LTS or RHEL 9

#### **High Availability Setup**
- **Minimum Nodes:** 5 (3 masters, 2+ workers)
- **Load Balancers:** 2+ (active-passive)
- **Database Replicas:** 3+ (1 primary, 2+ replicas)
- **Geographic Distribution:** 2+ regions

---

## 🔧 **PREREQUISITOS**

### **Software Dependencies**

#### **Container Runtime**
```bash
# Docker Installation
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.21.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

#### **Kubernetes**
```bash
# kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# Helm
curl https://baltocdn.com/helm/signing.asc | gpg --dearmor | sudo tee /usr/share/keyrings/helm.gpg > /dev/null
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/helm.gpg] https://baltocdn.com/helm/stable/debian/ all main" | sudo tee /etc/apt/sources.list.d/helm-stable-debian.list
sudo apt-get update
sudo apt-get install helm
```

#### **Additional Tools**
```bash
# Istio Service Mesh
curl -L https://istio.io/downloadIstio | sh -
sudo mv istio-*/bin/istioctl /usr/local/bin/

# Terraform (Infrastructure as Code)
wget -O- https://apt.releases.hashicorp.com/gpg | sudo gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/hashicorp.list
sudo apt update && sudo apt install terraform
```

### **Cloud Provider Setup**

#### **AWS (Recommended)**
```bash
# AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Configure AWS credentials
aws configure
```

#### **Google Cloud Platform**
```bash
# gcloud CLI
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
gcloud init
```

#### **Microsoft Azure**
```bash
# Azure CLI
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
az login
```

---

## 🚀 **DEPLOYMENT STEPS**

### **Step 1: Infrastructure Provisioning**

#### **Using Terraform (AWS)**

**1. Clone Infrastructure Repository:**
```bash
git clone https://github.com/teereserve/infrastructure-aws.git
cd infrastructure-aws
```

**2. Configure Variables:**
```hcl
# terraform.tfvars
region = "us-west-2"
environment = "production"
cluster_name = "teereserve-prod"
node_count = 5
node_instance_type = "m5.2xlarge"
database_instance_class = "db.r5.xlarge"
redis_node_type = "cache.r5.large"
```

**3. Deploy Infrastructure:**
```bash
terraform init
terraform plan
terraform apply
```

#### **Manual Setup (Alternative)**

**1. Create VPC and Networking:**
```bash
# Create VPC
aws ec2 create-vpc --cidr-block 10.0.0.0/16 --tag-specifications 'ResourceType=vpc,Tags=[{Key=Name,Value=teereserve-vpc}]'

# Create Subnets
aws ec2 create-subnet --vpc-id vpc-xxx --cidr-block 10.0.1.0/24 --availability-zone us-west-2a
aws ec2 create-subnet --vpc-id vpc-xxx --cidr-block 10.0.2.0/24 --availability-zone us-west-2b
```

**2. Create EKS Cluster:**
```bash
eksctl create cluster \
  --name teereserve-prod \
  --version 1.28 \
  --region us-west-2 \
  --nodegroup-name workers \
  --node-type m5.2xlarge \
  --nodes 5 \
  --nodes-min 3 \
  --nodes-max 10 \
  --managed
```

### **Step 2: Database Setup**

#### **PostgreSQL (Primary Database)**

**1. Deploy PostgreSQL Cluster:**
```bash
# Add Bitnami Helm repository
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update

# Install PostgreSQL with HA
helm install postgresql bitnami/postgresql-ha \
  --set postgresql.replicaCount=3 \
  --set postgresql.database=teereserve \
  --set postgresql.username=teereserve \
  --set postgresql.password=secure_password \
  --set persistence.size=100Gi \
  --set metrics.enabled=true
```

**2. Initialize Database Schema:**
```bash
# Get PostgreSQL connection details
kubectl get secret postgresql-postgresql-ha-postgresql -o jsonpath="{.data.password}" | base64 --decode

# Connect and initialize
kubectl exec -it postgresql-postgresql-ha-postgresql-0 -- psql -U teereserve -d teereserve -f /scripts/init.sql
```

#### **Redis (Caching and Sessions)**

**1. Deploy Redis Cluster:**
```bash
helm install redis bitnami/redis-cluster \
  --set cluster.nodes=6 \
  --set cluster.replicas=1 \
  --set persistence.size=20Gi \
  --set metrics.enabled=true
```

#### **MongoDB (Document Storage)**

**1. Deploy MongoDB:**
```bash
helm install mongodb bitnami/mongodb \
  --set architecture=replicaset \
  --set replicaCount=3 \
  --set auth.rootPassword=secure_password \
  --set persistence.size=50Gi
```

#### **InfluxDB (Time Series Data)**

**1. Deploy InfluxDB:**
```bash
helm repo add influxdata https://helm.influxdata.com/
helm install influxdb influxdata/influxdb2 \
  --set persistence.size=100Gi \
  --set adminUser.password=secure_password
```

### **Step 3: Service Mesh Setup**

#### **Install Istio**

**1. Install Istio Control Plane:**
```bash
istioctl install --set values.defaultRevision=default -y

# Enable automatic sidecar injection
kubectl label namespace default istio-injection=enabled
```

**2. Install Istio Addons:**
```bash
# Kiali (Service Mesh Observability)
kubectl apply -f https://raw.githubusercontent.com/istio/istio/release-1.19/samples/addons/kiali.yaml

# Jaeger (Distributed Tracing)
kubectl apply -f https://raw.githubusercontent.com/istio/istio/release-1.19/samples/addons/jaeger.yaml

# Prometheus (Metrics)
kubectl apply -f https://raw.githubusercontent.com/istio/istio/release-1.19/samples/addons/prometheus.yaml
```

### **Step 4: Application Deployment**

#### **Prepare Application Secrets**

**1. Create Kubernetes Secrets:**
```bash
# Database credentials
kubectl create secret generic database-secrets \
  --from-literal=postgresql-url="postgresql://teereserve:password@postgresql:5432/teereserve" \
  --from-literal=redis-url="redis://redis:6379" \
  --from-literal=mongodb-url="mongodb://mongodb:27017/teereserve"

# Application secrets
kubectl create secret generic app-secrets \
  --from-literal=jwt-secret="your-jwt-secret" \
  --from-literal=openai-api-key="your-openai-key" \
  --from-literal=stripe-secret-key="your-stripe-key"

# Blockchain secrets
kubectl create secret generic blockchain-secrets \
  --from-literal=private-key="your-private-key" \
  --from-literal=infura-project-id="your-infura-id"
```

#### **Deploy Core Services**

**1. API Gateway:**
```yaml
# api-gateway-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-gateway
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api-gateway
  template:
    metadata:
      labels:
        app: api-gateway
    spec:
      containers:
      - name: api-gateway
        image: teereserve/api-gateway:v5.0.0
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: database-secrets
              key: postgresql-url
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
```

**2. Web Application:**
```yaml
# web-app-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app
spec:
  replicas: 5
  selector:
    matchLabels:
      app: web-app
  template:
    metadata:
      labels:
        app: web-app
    spec:
      containers:
      - name: web-app
        image: teereserve/web-app:v5.0.0
        ports:
        - containerPort: 3000
        env:
        - name: NEXT_PUBLIC_API_URL
          value: "https://api.teereserve.com"
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

#### **Deploy ML Services**

**1. Deep Learning Service:**
```yaml
# ml-service-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ml-service
spec:
  replicas: 2
  selector:
    matchLabels:
      app: ml-service
  template:
    metadata:
      labels:
        app: ml-service
    spec:
      containers:
      - name: ml-service
        image: teereserve/ml-service:v5.0.0
        ports:
        - containerPort: 8000
        resources:
          requests:
            memory: "2Gi"
            cpu: "1000m"
            nvidia.com/gpu: 1
          limits:
            memory: "4Gi"
            cpu: "2000m"
            nvidia.com/gpu: 1
```

#### **Deploy IoT Services**

**1. IoT Gateway:**
```yaml
# iot-gateway-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: iot-gateway
spec:
  replicas: 3
  selector:
    matchLabels:
      app: iot-gateway
  template:
    metadata:
      labels:
        app: iot-gateway
    spec:
      containers:
      - name: iot-gateway
        image: teereserve/iot-gateway:v5.0.0
        ports:
        - containerPort: 1883  # MQTT
        - containerPort: 8080  # HTTP
        env:
        - name: INFLUXDB_URL
          valueFrom:
            secretKeyRef:
              name: database-secrets
              key: influxdb-url
```

#### **Deploy Blockchain Services**

**1. Blockchain Service:**
```yaml
# blockchain-service-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: blockchain-service
spec:
  replicas: 2
  selector:
    matchLabels:
      app: blockchain-service
  template:
    metadata:
      labels:
        app: blockchain-service
    spec:
      containers:
      - name: blockchain-service
        image: teereserve/blockchain-service:v5.0.0
        ports:
        - containerPort: 3001
        env:
        - name: ETHEREUM_NETWORK
          value: "mainnet"
        - name: PRIVATE_KEY
          valueFrom:
            secretKeyRef:
              name: blockchain-secrets
              key: private-key
```

### **Step 5: Networking and Ingress**

#### **Configure Ingress Controller**

**1. Install NGINX Ingress:**
```bash
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm install ingress-nginx ingress-nginx/ingress-nginx \
  --set controller.replicaCount=3 \
  --set controller.nodeSelector."kubernetes\.io/os"=linux \
  --set defaultBackend.nodeSelector."kubernetes\.io/os"=linux
```

**2. Configure Ingress Rules:**
```yaml
# ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: teereserve-ingress
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/rate-limit: "100"
spec:
  tls:
  - hosts:
    - teereserve.com
    - api.teereserve.com
    secretName: teereserve-tls
  rules:
  - host: teereserve.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: web-app
            port:
              number: 3000
  - host: api.teereserve.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: api-gateway
            port:
              number: 3000
```

#### **SSL/TLS Configuration**

**1. Install Cert-Manager:**
```bash
helm repo add jetstack https://charts.jetstack.io
helm install cert-manager jetstack/cert-manager \
  --namespace cert-manager \
  --create-namespace \
  --version v1.13.0 \
  --set installCRDs=true
```

**2. Configure Let's Encrypt:**
```yaml
# cluster-issuer.yaml
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: admin@teereserve.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx
```

### **Step 6: Monitoring and Observability**

#### **Prometheus and Grafana**

**1. Install Monitoring Stack:**
```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm install monitoring prometheus-community/kube-prometheus-stack \
  --set grafana.adminPassword=secure_password \
  --set prometheus.prometheusSpec.retention=30d \
  --set prometheus.prometheusSpec.storageSpec.volumeClaimTemplate.spec.resources.requests.storage=100Gi
```

**2. Configure Custom Dashboards:**
```bash
# Import TeeReserve specific dashboards
kubectl apply -f monitoring/dashboards/
```

#### **Logging with ELK Stack**

**1. Install Elasticsearch:**
```bash
helm repo add elastic https://helm.elastic.co
helm install elasticsearch elastic/elasticsearch \
  --set replicas=3 \
  --set minimumMasterNodes=2 \
  --set volumeClaimTemplate.resources.requests.storage=100Gi
```

**2. Install Kibana:**
```bash
helm install kibana elastic/kibana \
  --set elasticsearchHosts="http://elasticsearch-master:9200"
```

**3. Install Filebeat:**
```bash
helm install filebeat elastic/filebeat
```

### **Step 7: Security Configuration**

#### **Network Policies**

**1. Default Deny Policy:**
```yaml
# default-deny.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-all
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress
```

**2. Application-specific Policies:**
```yaml
# api-gateway-policy.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: api-gateway-policy
spec:
  podSelector:
    matchLabels:
      app: api-gateway
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: ingress-nginx
    ports:
    - protocol: TCP
      port: 3000
  egress:
  - to:
    - podSelector:
        matchLabels:
          app: postgresql
    ports:
    - protocol: TCP
      port: 5432
```

#### **Pod Security Standards**

**1. Configure Pod Security:**
```yaml
# pod-security-policy.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: teereserve
  labels:
    pod-security.kubernetes.io/enforce: restricted
    pod-security.kubernetes.io/audit: restricted
    pod-security.kubernetes.io/warn: restricted
```

#### **RBAC Configuration**

**1. Service Account and Roles:**
```yaml
# rbac.yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: teereserve-sa
---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: teereserve-role
rules:
- apiGroups: [""]
  resources: ["pods", "services", "configmaps", "secrets"]
  verbs: ["get", "list", "watch"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: teereserve-binding
subjects:
- kind: ServiceAccount
  name: teereserve-sa
roleRef:
  kind: Role
  name: teereserve-role
  apiGroup: rbac.authorization.k8s.io
```

---

## 🔍 **VERIFICATION AND TESTING**

### **Health Checks**

#### **Application Health**
```bash
# Check all pods are running
kubectl get pods -A

# Check services
kubectl get services

# Check ingress
kubectl get ingress

# Test API endpoints
curl -k https://api.teereserve.com/health
curl -k https://teereserve.com
```

#### **Database Connectivity**
```bash
# Test PostgreSQL
kubectl exec -it postgresql-0 -- psql -U teereserve -c "SELECT version();"

# Test Redis
kubectl exec -it redis-0 -- redis-cli ping

# Test MongoDB
kubectl exec -it mongodb-0 -- mongosh --eval "db.adminCommand('ping')"
```

### **Performance Testing**

#### **Load Testing**
```bash
# Install k6
sudo apt-get update
sudo apt-get install k6

# Run load test
k6 run --vus 100 --duration 5m load-test.js
```

**Load Test Script (load-test.js):**
```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  vus: 100,
  duration: '5m',
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.1'],
  },
};

export default function() {
  let response = http.get('https://api.teereserve.com/health');
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
  sleep(1);
}
```

### **Security Testing**

#### **Vulnerability Scanning**
```bash
# Install Trivy
sudo apt-get install wget apt-transport-https gnupg lsb-release
wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | sudo apt-key add -
echo "deb https://aquasecurity.github.io/trivy-repo/deb $(lsb_release -sc) main" | sudo tee -a /etc/apt/sources.list.d/trivy.list
sudo apt-get update
sudo apt-get install trivy

# Scan container images
trivy image teereserve/api-gateway:v5.0.0
trivy image teereserve/web-app:v5.0.0
```

#### **Network Security Testing**
```bash
# Install nmap
sudo apt-get install nmap

# Scan for open ports
nmap -sS -O target_ip

# Test SSL configuration
sslscan teereserve.com
```

---

## 📊 **MONITORING AND ALERTING**

### **Key Metrics to Monitor**

#### **Application Metrics**
- **Request Rate:** Requests per second
- **Response Time:** P50, P95, P99 latencies
- **Error Rate:** 4xx/5xx error percentage
- **Throughput:** Data processed per second
- **Active Users:** Concurrent users

#### **Infrastructure Metrics**
- **CPU Utilization:** Per node and pod
- **Memory Usage:** Available vs used
- **Disk I/O:** Read/write operations
- **Network Traffic:** Ingress/egress bandwidth
- **Pod Restarts:** Frequency and causes

#### **Business Metrics**
- **Booking Conversion Rate**
- **Revenue per User**
- **Feature Adoption Rate**
- **Customer Satisfaction Score**
- **System Availability**

### **Alerting Rules**

#### **Critical Alerts**
```yaml
# critical-alerts.yaml
groups:
- name: critical
  rules:
  - alert: ServiceDown
    expr: up == 0
    for: 1m
    labels:
      severity: critical
    annotations:
      summary: "Service {{ $labels.instance }} is down"
      
  - alert: HighErrorRate
    expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
    for: 5m
    labels:
      severity: critical
    annotations:
      summary: "High error rate detected"
      
  - alert: DatabaseConnectionFailure
    expr: postgresql_up == 0
    for: 2m
    labels:
      severity: critical
    annotations:
      summary: "Database connection failure"
```

#### **Warning Alerts**
```yaml
# warning-alerts.yaml
groups:
- name: warning
  rules:
  - alert: HighLatency
    expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 0.5
    for: 10m
    labels:
      severity: warning
    annotations:
      summary: "High latency detected"
      
  - alert: HighMemoryUsage
    expr: (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes > 0.8
    for: 15m
    labels:
      severity: warning
    annotations:
      summary: "High memory usage"
```

### **Dashboard Configuration**

#### **Executive Dashboard**
- **System Health Overview**
- **Business KPIs**
- **Revenue Metrics**
- **User Engagement**
- **Performance Summary**

#### **Technical Dashboard**
- **Infrastructure Metrics**
- **Application Performance**
- **Error Rates and Logs**
- **Database Performance**
- **Security Events**

#### **Operations Dashboard**
- **Deployment Status**
- **Resource Utilization**
- **Scaling Events**
- **Maintenance Windows**
- **Incident Timeline**

---

## 🔄 **MAINTENANCE AND UPDATES**

### **Regular Maintenance Tasks**

#### **Daily Tasks**
```bash
# Check system health
kubectl get pods -A | grep -v Running
kubectl top nodes
kubectl top pods

# Review logs for errors
kubectl logs -l app=api-gateway --tail=100 | grep ERROR

# Check certificate expiration
kubectl get certificates
```

#### **Weekly Tasks**
```bash
# Update security patches
sudo apt update && sudo apt upgrade

# Review monitoring alerts
# Check performance trends
# Validate backup integrity

# Clean up old resources
kubectl delete pods --field-selector=status.phase=Succeeded
docker system prune -f
```

#### **Monthly Tasks**
```bash
# Review and update dependencies
npm audit
pip list --outdated

# Performance optimization review
# Security audit
# Capacity planning review
# Disaster recovery testing
```

### **Update Procedures**

#### **Application Updates**

**1. Blue-Green Deployment:**
```bash
# Deploy new version to green environment
kubectl apply -f k8s/green-deployment.yaml

# Test green environment
curl -H "Host: teereserve.com" http://green-service-ip/health

# Switch traffic to green
kubectl patch service web-app -p '{"spec":{"selector":{"version":"green"}}}'

# Monitor and rollback if needed
kubectl patch service web-app -p '{"spec":{"selector":{"version":"blue"}}}'
```

**2. Rolling Updates:**
```bash
# Update deployment image
kubectl set image deployment/api-gateway api-gateway=teereserve/api-gateway:v5.1.0

# Monitor rollout
kubectl rollout status deployment/api-gateway

# Rollback if needed
kubectl rollout undo deployment/api-gateway
```

#### **Database Updates**

**1. Schema Migrations:**
```bash
# Create migration job
kubectl create job migration-v5-1 --from=cronjob/migration-template

# Monitor migration progress
kubectl logs job/migration-v5-1 -f

# Verify migration success
kubectl exec -it postgresql-0 -- psql -U teereserve -c "SELECT version FROM schema_migrations ORDER BY version DESC LIMIT 1;"
```

**2. Database Backups:**
```bash
# Create backup
kubectl create job backup-$(date +%Y%m%d) --from=cronjob/backup-template

# Verify backup
kubectl logs job/backup-$(date +%Y%m%d)

# Test restore procedure (in staging)
kubectl exec -it postgresql-staging-0 -- pg_restore -U teereserve -d teereserve_staging /backups/latest.dump
```

### **Scaling Procedures**

#### **Horizontal Pod Autoscaling**
```yaml
# hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-gateway-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api-gateway
  minReplicas: 3
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

#### **Cluster Autoscaling**
```bash
# Enable cluster autoscaler
eksctl create nodegroup \
  --cluster=teereserve-prod \
  --name=autoscaling-workers \
  --node-type=m5.large \
  --nodes=3 \
  --nodes-min=3 \
  --nodes-max=20 \
  --asg-access
```

---

## 🚨 **DISASTER RECOVERY**

### **Backup Strategy**

#### **Database Backups**
```bash
# Automated daily backups
kubectl create cronjob postgresql-backup \
  --image=postgres:15 \
  --schedule="0 2 * * *" \
  --restart=OnFailure \
  -- /bin/bash -c "pg_dump -h postgresql -U teereserve teereserve | gzip > /backups/teereserve-$(date +%Y%m%d).sql.gz"
```

#### **Application State Backups**
```bash
# Backup persistent volumes
kubectl create cronjob pv-backup \
  --image=restic/restic \
  --schedule="0 3 * * *" \
  --restart=OnFailure \
  -- restic backup /data --repo s3:s3.amazonaws.com/teereserve-backups
```

#### **Configuration Backups**
```bash
# Backup Kubernetes configurations
kubectl get all,configmap,secret,pv,pvc -o yaml > cluster-backup-$(date +%Y%m%d).yaml

# Store in version control
git add cluster-backup-$(date +%Y%m%d).yaml
git commit -m "Cluster backup $(date +%Y%m%d)"
git push origin main
```

### **Recovery Procedures**

#### **Database Recovery**
```bash
# Restore from backup
kubectl exec -it postgresql-0 -- psql -U teereserve -c "DROP DATABASE IF EXISTS teereserve;"
kubectl exec -it postgresql-0 -- psql -U teereserve -c "CREATE DATABASE teereserve;"
kubectl exec -it postgresql-0 -- bash -c "gunzip -c /backups/teereserve-20240726.sql.gz | psql -U teereserve teereserve"
```

#### **Full Cluster Recovery**
```bash
# Recreate cluster
eksctl create cluster --config-file=cluster-config.yaml

# Restore configurations
kubectl apply -f cluster-backup-20240726.yaml

# Restore data
kubectl exec -it postgresql-0 -- pg_restore -U teereserve -d teereserve /backups/latest.dump
```

### **RTO/RPO Targets**

#### **Recovery Time Objective (RTO)**
- **Critical Services:** 15 minutes
- **Non-critical Services:** 1 hour
- **Full System Recovery:** 4 hours

#### **Recovery Point Objective (RPO)**
- **Transactional Data:** 5 minutes
- **User Content:** 1 hour
- **Analytics Data:** 24 hours

---

## 📞 **SUPPORT AND TROUBLESHOOTING**

### **Common Issues**

#### **Pod Startup Issues**
```bash
# Check pod status
kubectl describe pod <pod-name>

# Check logs
kubectl logs <pod-name> --previous

# Check resource constraints
kubectl top pod <pod-name>

# Check node resources
kubectl describe node <node-name>
```

#### **Database Connection Issues**
```bash
# Test database connectivity
kubectl exec -it api-gateway-xxx -- nc -zv postgresql 5432

# Check database logs
kubectl logs postgresql-0

# Verify credentials
kubectl get secret database-secrets -o yaml
```

#### **Performance Issues**
```bash
# Check resource utilization
kubectl top nodes
kubectl top pods

# Review metrics in Grafana
# Check for memory leaks
# Analyze slow queries
```

### **Emergency Contacts**

#### **On-Call Rotation**
- **Primary:** DevOps Engineer (+1-555-0101)
- **Secondary:** Senior Developer (+1-555-0102)
- **Escalation:** Engineering Manager (+1-555-0103)

#### **Vendor Support**
- **AWS Support:** Enterprise Support Plan
- **MongoDB Atlas:** Premium Support
- **Redis Enterprise:** 24/7 Support

### **Runbooks**

#### **Service Restart Procedure**
1. Identify affected service
2. Check for ongoing deployments
3. Scale down to 0 replicas
4. Wait for graceful shutdown
5. Scale back to desired replicas
6. Verify service health
7. Update incident log

#### **Database Failover Procedure**
1. Identify primary database failure
2. Promote replica to primary
3. Update application configuration
4. Restart affected services
5. Monitor for data consistency
6. Plan primary recovery

---

## 📋 **CHECKLIST**

### **Pre-Deployment Checklist**

#### **Infrastructure**
- [ ] Kubernetes cluster provisioned
- [ ] Node groups configured with appropriate instance types
- [ ] Networking and security groups configured
- [ ] Load balancer and ingress controller installed
- [ ] SSL certificates configured
- [ ] DNS records updated

#### **Databases**
- [ ] PostgreSQL cluster deployed and configured
- [ ] Redis cluster deployed and configured
- [ ] MongoDB deployed and configured
- [ ] InfluxDB deployed and configured
- [ ] Database schemas initialized
- [ ] Backup procedures configured

#### **Security**
- [ ] Network policies applied
- [ ] RBAC configured
- [ ] Secrets management configured
- [ ] Pod security standards enforced
- [ ] Vulnerability scanning completed
- [ ] Security monitoring enabled

#### **Monitoring**
- [ ] Prometheus and Grafana deployed
- [ ] Custom dashboards configured
- [ ] Alerting rules configured
- [ ] Log aggregation configured
- [ ] Distributed tracing enabled

### **Post-Deployment Checklist**

#### **Verification**
- [ ] All services are running and healthy
- [ ] Database connectivity verified
- [ ] API endpoints responding correctly
- [ ] Web application accessible
- [ ] SSL certificates valid
- [ ] Monitoring and alerting functional

#### **Performance**
- [ ] Load testing completed
- [ ] Performance benchmarks met
- [ ] Auto-scaling configured and tested
- [ ] Resource utilization optimized

#### **Security**
- [ ] Security scanning completed
- [ ] Penetration testing performed
- [ ] Access controls verified
- [ ] Audit logging enabled

#### **Documentation**
- [ ] Deployment documentation updated
- [ ] Runbooks created/updated
- [ ] Team training completed
- [ ] Emergency procedures documented

---

## 📚 **ADDITIONAL RESOURCES**

### **Documentation Links**
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Helm Charts](https://helm.sh/docs/)
- [Istio Service Mesh](https://istio.io/latest/docs/)
- [Prometheus Monitoring](https://prometheus.io/docs/)
- [Grafana Dashboards](https://grafana.com/docs/)

### **Training Resources**
- [Kubernetes Fundamentals](https://kubernetes.io/training/)
- [Docker Certification](https://www.docker.com/certification/)
- [AWS EKS Workshop](https://www.eksworkshop.com/)
- [Istio Workshop](https://istio.io/latest/docs/setup/)

### **Community Support**
- [Kubernetes Slack](https://kubernetes.slack.com/)
- [CNCF Community](https://www.cncf.io/community/)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/kubernetes)
- [Reddit r/kubernetes](https://www.reddit.com/r/kubernetes/)

---

*Esta guía de deployment proporciona una base sólida para el despliegue exitoso de TeeReserve Fase 5 en entornos de producción. Para soporte adicional, contacte al equipo de DevOps en devops@teereserve.com*

**Versión:** 5.0.0  
**Fecha:** Julio 2024  
**Autor:** TeeReserve DevOps Team  
**Estado:** Production Ready

