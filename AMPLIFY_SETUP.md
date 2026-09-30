# AWS Amplify Deployment Guide

## Pre-requisitos

1. Cuenta de AWS
2. MongoDB Atlas para base de datos en producción
3. Google Cloud Console para OAuth credentials

## Configuración de Variables de Entorno en Amplify

Navega a tu app en AWS Amplify Console → App settings → Environment variables → Edit

### Variables requeridas:

```
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
MONGODB_DATABASE=fincheck
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
PORT=3000
```

### MongoDB Atlas Setup

1. Ve a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crea un cluster gratuito
3. Crea un usuario de base de datos
4. Configura Network Access (IP whitelist) - permite acceso desde 0.0.0.0/0 para AWS
5. Obtén tu connection string

### Google OAuth Setup

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita Google+ API
4. Ve a Credentials → Create Credentials → OAuth client ID
5. Configura:
   - Application type: Web application
   - Authorized redirect URIs: `https://<your-amplify-domain>/api/oauth/google/callback`
6. Copia Client ID y Client Secret

## Pasos de Despliegue

### Opción 1: AWS Console

1. Ve a [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Click en "New app" → "Host web app"
3. Conecta tu repositorio (GitHub, GitLab, Bitbucket)
4. Configura build settings:
   - Build settings: Usa el archivo `amplify.yml` incluido
   - Branch: `main` o `master`
5. Click en "Next" y luego "Save and deploy"

### Opción 2: AWS CLI

```bash
# Instala AWS CLI y configura tus credenciales
aws configure

# Inicializa Amplify
npm install -g @aws-amplify/cli
amplify init

# Agrega hosting
amplify add hosting

# Despliega
amplify publish
```

## Configuración del Dominio

1. En Amplify Console → Domain management
2. Compra un dominio o usa uno existente
3. Configura DNS records
4. Configura SSL certificate (gratuito en Amplify)

## Monitoreo

- Amplify Console proporciona logs de build y runtime
- Configura CloudWatch para monitoreo avanzado
- Configura alarms para errores y latencia

## Debugging

Si encuentras errores:

1. Revisa los build logs en Amplify Console
2. Verifica que todas las variables de entorno estén configuradas
3. Asegúrate que MongoDB Atlas permita conexiones desde AWS IPs
4. Verifica que el redirect URI de Google OAuth sea correcto

## Costos Estimados

- AWS Amplify Hosting: ~$0-20/mes (depende del tráfico)
- MongoDB Atlas: Gratis para tier M0
- Sin costos fijos adicionales
