/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Usando un degradado como "color" (requiere ajuste en el uso)
        'custom-blue': '#023e8a', // Ejemplo con los colores que mencionaste
      },
      // Opción recomendada: Definirlo como backgroundImage
      backgroundImage: {
        'custom-blue': 'linear-gradient(to right, #0077b6, #023e8a)', // Más semántico
      },
    },
  },
  plugins: [],
}