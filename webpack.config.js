// webpack.config.js
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  // Solo se aplica el plugin de análisis cuando el build se ejecuta con este config
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: 'static', // Genera un archivo HTML
      reportFilename: 'bundle-report.html', // Nombre del archivo de salida
      openAnalyzer: false, // No abrir automáticamente el navegador (opcional)
    }),
  ],
};