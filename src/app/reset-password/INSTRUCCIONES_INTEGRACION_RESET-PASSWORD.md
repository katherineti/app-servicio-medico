# Integración del Sistema de Restablecimiento de Contraseña

## Componentes Creados

1. **ForgotPasswordComponent** (`forgot-password.component.ts`)
   - Solicita el email del usuario
   - Envía petición al backend para generar token
   - Muestra confirmación visual

2. **ResetPasswordComponent** (`reset-password.component.ts`)
   - Recibe el token desde la URL (query params)
   - Valida requisitos de contraseña en tiempo real
   - Confirma que las contraseñas coincidan
   - Envía nueva contraseña al backend

3. **PasswordRecoveryService** (`password-recovery.service.ts`)
   - Métodos HTTP para forgot-password y reset-password
   - Integración con el backend

## Configuración de Rutas

Agrega estas rutas en tu archivo de routing (normalmente `app.routes.ts` o `app-routing.module.ts`):

\`\`\`typescript
import { Routes } from '@angular/router';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';

export const routes: Routes = [
  // ... tus rutas existentes
  {
    path: 'forgot-password',
    component: ForgotPasswordComponent
  },
  {
    path: 'reset-password',
    component: ResetPasswordComponent
  },
  // ... más rutas
];
\`\`\`

## Flujo de Usuario

1. **Usuario olvida su contraseña:**
   - Hace clic en "¿Olvidaste tu contraseña?" en el login
   - Navega a `/forgot-password`
   - Ingresa su email
   - Recibe confirmación en pantalla

2. **Usuario recibe email (Backend):**
   - El backend envía un email con un enlace como:
   - `http://tu-dominio.com/reset-password?token=abc123xyz`

3. **Usuario restablece contraseña:**
   - Hace clic en el enlace del email
   - Navega a `/reset-password?token=abc123xyz`
   - El componente captura el token de la URL
   - Ingresa nueva contraseña con validaciones en tiempo real
   - Confirma la contraseña
   - Ve indicadores visuales de requisitos cumplidos
   - Envía el formulario
   - Es redirigido al login automáticamente

## Requisitos de Contraseña (Validados en Frontend)

- Longitud: 10-16 caracteres
- Al menos una mayúscula
- Al menos un número
- Al menos un carácter especial: . * - % /
- Sin letras iguales consecutivas

## Configuración del Backend

Asegúrate de que tu backend tenga configurado el envío de emails.
En el archivo que creamos anteriormente (`auth.service.ts` del backend),
el token se retorna en desarrollo pero debes integrarlo con un servicio de email.

### Ejemplo de integración con Nodemailer:

\`\`\`typescript
// En tu auth.service.ts del backend
import * as nodemailer from 'nodemailer';

async forgotPassword(email: string) {
  // ... código existente para generar token ...
  
  // Configurar transporte de email
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // URL del frontend
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  // Enviar email
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Restablecimiento de Contraseña',
    html: `
      <h2>Restablecimiento de Contraseña</h2>
      <p>Has solicitado restablecer tu contraseña.</p>
      <p>Haz clic en el siguiente enlace para continuar:</p>
      <a href="${resetUrl}">Restablecer Contraseña</a>
      <p>Este enlace expirará en 1 hora.</p>
      <p>Si no solicitaste este cambio, ignora este correo.</p>
    `,
  });

  return {
    ok: true,
    message: 'Correo de restablecimiento enviado',
  };
}
\`\`\`

## Variables de Entorno Necesarias

Agrega estas variables a tu `.env` del backend:

\`\`\`env
FRONTEND_URL=http://localhost:4200
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-contraseña-de-aplicación
SMTP_FROM=noreply@tuapp.com
\`\`\`

## Configuración del Frontend

En el archivo `password-recovery.service.ts`, asegúrate de que la URL del API sea correcta:

\`\`\`typescript
private apiUrl = 'http://localhost:3000/auth'; // Ajusta según tu backend
\`\`\`

## Testing del Flujo Completo

1. Inicia tu backend: `npm run start:dev`
2. Inicia tu frontend: `ng serve`
3. Navega a `/forgot-password`
4. Ingresa un email válido
5. Revisa la consola del backend para ver el token generado (en desarrollo)
6. Copia el token y navega a `/reset-password?token=TU_TOKEN_AQUI`
7. Ingresa la nueva contraseña
8. Verifica que puedas hacer login con la nueva contraseña

## Seguridad

- Los tokens expiran en 1 hora
- Los tokens son de un solo uso
- Las contraseñas se validan en frontend y backend
- Las contraseñas se hashean con Argon2 antes de guardarse
- El sistema no revela si un email existe en la base de datos (por seguridad)

## Estilos

Todos los componentes usan el mismo diseño visual:
- Imagen de fondo en desktop (columna izquierda)
- Formulario en columna derecha
- Responsive: en móvil solo se muestra el formulario
- Indicadores visuales en tiempo real
- Animaciones suaves y feedback claro
