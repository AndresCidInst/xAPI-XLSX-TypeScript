# xAPI-XLSX-TypeScript

## Instalación
 1. Clonar el repositorio se deben instalar las dependencias

```
npm install
```

2. Después crear las carpeta **Data** y **Out** en la dirección raíz del proyecto
3. Crear un archivo **.env**
4. Crear en el archivo de variables de entorno la variable *LRS_ID* e ingresar el ID del LRS del cual desea extraer las interacciones xAPI

## Ejecución
1. Ingresar la data extraída del LRS en formato CSV en la carpeta data
2. Ejecutar el comando
```
npm run dev
```
3. Econtrará la data transformada en formato Excel en la carpeta 'Out'
