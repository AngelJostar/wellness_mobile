# Wellness móvil

React Native con Expo SDK 58, TypeScript y Expo Router. Incluye registro, acceso, verificación en dos pasos cuando esté activada, perfil básico y cierre de sesión.

## Desarrollo local

    npm install
    npx expo start

La API debe estar iniciada desde wellness_web:

    php artisan serve

Configurar .env a partir de .env.example con la IP IPv4 de la computadora y el puerto 8083:

    EXPO_PUBLIC_API_URL=http://IP_DE_TU_COMPUTADORA:8083/api

La configuración actual está preparada para Android Emulator: EXPO_PUBLIC_API_URL=http://10.0.2.2:8083/api. Para un celular físico, usar la IP LAN de la computadora e iniciar Laravel con php artisan serve --host=0.0.0.0 --port=8083. Celular y computadora deben estar en la misma red. Reiniciar Expo después de cambiar .env.

localhost en un celular apunta al propio celular. No colocar claves de MySQL ni secretos en variables EXPO_PUBLIC_*.

## Sesión

En Android/iOS, el token se guarda en Expo SecureStore y se valida al abrir la app.
En la vista previa web se conserva solo en memoria: recargar requiere iniciar sesión nuevamente.
Si la API no está disponible durante la recuperación de sesión, la app permite reintentar sin eliminar el token.
Un token expirado o revocado devuelve al acceso. Cerrar sesión revoca el token del dispositivo actual.
Los usuarios se comparten con el sitio web; se puede entrar con una cuenta creada desde cualquiera de los dos.
La recuperación de contraseña, verificación de correo y gestión de doble factor se realizan desde la web.
El tráfico HTTP es para desarrollo local; configurar HTTPS para producción.

## Verificaciones

    npx expo lint
    npx tsc --noEmit
    npx expo-doctor
    npx expo export --platform all
## Dependencias pendientes del SDK

La revisión npm audit reportó 5 alertas altas en la cadena de herramientas de Expo, relacionadas con node-forge y zod. La versión publicada de node-forge sigue siendo 1.4.0 y Expo CLI requiere Zod 3. La corrección automática propuesta intenta retroceder Expo a SDK 44; no se aplicó porque rompería la compatibilidad de SDK 58. Revisar actualizaciones compatibles del SDK antes de distribuir la aplicación.