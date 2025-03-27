# xAPI-XLSX-TypeScript

## Instalación
 1. Clonar el repositorio se deben instalar las dependencias

```
npm install
```

2. Después crear las carpeta **data** y **out** en la dirección raíz del proyecto
3. Crear un archivo **.env**
4. Crear en el archivo de variables de entorno la variable *LRS_ID* e ingresar el ID del LRS del cual desea extraer las interacciones xAPI

## Antes de la ejecución
El script necesita de archivos para su ejecución, estos son un **diccionario de datos** y uno perteneciente a los **poryecto asociados a los usuarios**
Estos se pueden encontrar dentro de la carpeta [Documentación de la interacción de usuario](https://drive.google.com/drive/u/0/folders/10KdBUqV56IZ7Z7_moHHieND6Kcjfj1Pq)

Estos archivos deben estar en la carpeta **Data** y tener los respectivos nombres:
1. DiccionarioDatosYComplementos
2. Usuarios-TEGO-con-proyecto

Este último debe contar con 2 columnas obligatorias:
- run: Se debe posicionar en la columna B
- proyecto: Se debe posicionar en la columna E

> [!IMPORTANT]
> Ambos archivos deben estar en formato excel, es decir **.xlsx**

## Ejecución
1. Ingresar la data extraída del LRS en formato CSV en la carpeta data y renombrarlo como "TegoData.csv"
3. Ejecutar el comando
```
npm run dev
```
3. Econtrará la data transformada en formato Excel en la carpeta 'Out'
