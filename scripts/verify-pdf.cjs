// Gera amostras sintéticas usando exatamente o exportador do aplicativo.
const fs=require('node:fs'),path=require('node:path'),Module=require('node:module');
process.env.REACT_APP_USE_MOCK='true';
const babel=require('@babel/core');
const source=path.resolve('src/services/pdfExport.js');
const code=babel.transformFileSync(source,{presets:[['@babel/preset-env',{targets:{node:'current'}}]],babelrc:false,configFile:false}).code;
const compiled=new Module(source,module);compiled.filename=source;compiled.paths=Module._nodeModulePaths(path.dirname(source));compiled._compile(code,source);
const {exportDiagnosisPdf,exportHistoryPdf}=compiled.exports;
const directory=path.resolve('output/pdf');fs.mkdirSync(directory,{recursive:true});
const example={id:'qa-sintetico',disease:'Exemplo de revisão visual',scientificName:'Registro sintético',confidence:.92,modelUsed:'resnet50',timestamp:'2026-09-08T12:00:00Z',description:'Conteúdo de teste para conferir a exportação. Este documento não corresponde a uma análise de uma planta.',actionPlan:{essencial:Array.from({length:30},(_,i)=>'Orientação sintética '+(i+1)+': registre os sinais observados e o contexto da lavoura para discutir com um profissional.'),sources:[{name:'Catálogo demonstrativo',url:'https://example.com/referencia-de-teste'}]}};
const detail=exportDiagnosisPdf(example,{save:false});
fs.writeFileSync(path.join(directory,'qa-registro.pdf'),Buffer.from(detail.output('arraybuffer')));
const history=exportHistoryPdf(Array.from({length:80},(_,i)=>({...example,id:'qa-'+i,disease:'Registro sintético '+(i+1)})),{save:false});
fs.writeFileSync(path.join(directory,'qa-historico.pdf'),Buffer.from(history.output('arraybuffer')));
console.log('PDFs de QA: '+detail.getNumberOfPages()+' e '+history.getNumberOfPages()+' páginas.');
