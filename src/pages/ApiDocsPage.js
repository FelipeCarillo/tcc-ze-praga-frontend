import React, { useState, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import { BookOpen, Server, Key, Zap, AlertTriangle, Gauge } from 'lucide-react';
import EndpointCard from '../components/ApiDocs/EndpointCard';
import CodeBlock from '../components/ApiDocs/CodeBlock';
import ApiSidebar from '../components/ApiDocs/ApiSidebar';

const BASE_URL = 'https://api.zepraga.com.br/api/v1';

const SECTIONS = [
  { id: 'introducao', label: 'Introdução' },
  { id: 'autenticacao', label: 'Autenticação' },
  { id: 'quickstart', label: 'Quickstart' },
  { id: 'post-classify', label: 'POST /classify' },
  { id: 'get-models', label: 'GET /models' },
  { id: 'get-health', label: 'GET /health' },
  { id: 'erros', label: 'Códigos de Erro' },
  { id: 'rate-limiting', label: 'Rate Limiting' },
];

function ApiDocsPage() {
  const [activeSection, setActiveSection] = useState('introducao');
  const observerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          setActiveSection(visible[0].target.id);
        }
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0 }
    );
    observerRef.current = observer;

    SECTIONS.forEach((section) => {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <Box sx={{ display: 'flex', maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 3 }, py: 4 }}>
      <ApiSidebar sections={SECTIONS} activeSection={activeSection} />

      <Box
        sx={{
          flex: 1,
          pl: { md: 4 },
          ml: { md: 2 },
          borderLeft: { md: '1px solid' },
          borderColor: 'divider',
          maxWidth: '100%',
          overflow: 'hidden',
        }}
      >
        {/* Introducao */}
        <Box id="introducao" sx={{ scrollMarginTop: '100px', mb: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <BookOpen size={28} color="#2D6A4F" />
            <Typography variant="h3" sx={{ fontWeight: 700 }}>
              Documentação da API
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3, lineHeight: 1.7 }}>
            API RESTful pública para classificação de doenças foliares em soja.
            Integre o poder do diagnóstico fitossanitário do Zé Praga em seus próprios sistemas.
          </Typography>
          <Alert
            severity="info"
            sx={{
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              backgroundColor: 'surface.elevated',
              color: 'text.primary',
              '& .MuiAlert-icon': {
                color: 'primary.main',
              },
            }}
          >
            URL Base:{' '}
            <Box
              component="code"
              sx={{
                fontWeight: 600,
                color: 'text.primary',
                backgroundColor: 'surface.sunken',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                px: 0.75,
                py: 0.25,
              }}
            >
              {BASE_URL}
            </Box>
          </Alert>
        </Box>

        {/* Autenticacao */}
        <Box id="autenticacao" sx={{ scrollMarginTop: '100px', mb: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Key size={20} color="#2D6A4F" />
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Autenticação
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.7 }}>
            Todas as requisições devem incluir o header <code>Authorization</code> com sua API key.
            Você pode obter sua chave no painel de desenvolvedor.
          </Typography>
          <CodeBlock
            examples={{
              'Header': 'Authorization: Bearer YOUR_API_KEY',
            }}
          />
        </Box>

        {/* Quickstart */}
        <Box id="quickstart" sx={{ scrollMarginTop: '100px', mb: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Zap size={20} color="#2D6A4F" />
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Quickstart
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.7 }}>
            Envie uma imagem de folha de soja e receba o diagnóstico com plano de ação em poucos segundos.
          </Typography>
          <CodeBlock
            examples={{
              'cURL': `curl -X POST ${BASE_URL}/classify \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -F "image=@folha_soja.jpg" \\
  -F "model=ensemble" \\
  -F "include_action_plan=true" \\
  -F "action_plan_level=campo"`,
              'Python': `import requests

url = "${BASE_URL}/classify"
headers = {"Authorization": "Bearer YOUR_API_KEY"}
files = {"image": open("folha_soja.jpg", "rb")}
data = {
    "model": "ensemble",
    "include_action_plan": "true",
    "action_plan_level": "campo",  # essencial | campo | especialista
}

response = requests.post(url, headers=headers, files=files, data=data)
result = response.json()

print(f"Doença: {result['prediction']['class_name']}")
print(f"Confiança: {result['prediction']['confidence']:.1%}")
if "action_plan" in result:
    print(f"Nível: {result['action_plan']['level']}")
    for step in result["action_plan"]["actions"]:
        print(f"  - {step}")
    print("Fontes:")
    for src in result["action_plan"]["sources"]:
        print(f"  [{src['name']}] {src['detail']}")`,
              'JavaScript': `const formData = new FormData();
formData.append('image', fileInput.files[0]);
formData.append('model', 'ensemble');
formData.append('include_action_plan', 'true');
formData.append('action_plan_level', 'campo');

const response = await fetch('${BASE_URL}/classify', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer YOUR_API_KEY' },
  body: formData,
});

const result = await response.json();
console.log(\`Doença: \${result.prediction.class_name}\`);
console.log(\`Confiança: \${(result.prediction.confidence * 100).toFixed(1)}%\`);
if (result.action_plan) {
  console.log(\`Nível: \${result.action_plan.level}\`);
  console.log('Ações:', result.action_plan.actions);
  console.log('Fontes:', result.action_plan.sources);
}`,
              'Go': `package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "io"
    "mime/multipart"
    "net/http"
    "os"
)

func main() {
    file, _ := os.Open("folha_soja.jpg")
    defer file.Close()

    body := &bytes.Buffer{}
    writer := multipart.NewWriter(body)
    part, _ := writer.CreateFormFile("image", "folha_soja.jpg")
    io.Copy(part, file)
    writer.WriteField("model", "ensemble")
    writer.WriteField("include_action_plan", "true")
    writer.WriteField("action_plan_level", "campo")
    writer.Close()

    req, _ := http.NewRequest("POST", "${BASE_URL}/classify", body)
    req.Header.Set("Authorization", "Bearer YOUR_API_KEY")
    req.Header.Set("Content-Type", writer.FormDataContentType())

    resp, _ := http.DefaultClient.Do(req)
    defer resp.Body.Close()

    var result map[string]interface{}
    json.NewDecoder(resp.Body).Decode(&result)
    fmt.Println(result)
}`,
              'Ruby': `require 'net/http'
require 'json'

uri = URI("${BASE_URL}/classify")
request = Net::HTTP::Post.new(uri)
request["Authorization"] = "Bearer YOUR_API_KEY"

form_data = [
  ["image", File.open("folha_soja.jpg")],
  ["model", "ensemble"],
  ["include_action_plan", "true"],
  ["action_plan_level", "campo"]
]
request.set_form(form_data, "multipart/form-data")

response = Net::HTTP.start(uri.hostname, uri.port, use_ssl: true) do |http|
  http.request(request)
end

result = JSON.parse(response.body)
puts "Doença: #{result['prediction']['class_name']}"
puts "Confiança: #{(result['prediction']['confidence'] * 100).round(1)}%"
if result['action_plan']
  puts "Nível: #{result['action_plan']['level']}"
  result['action_plan']['sources'].each { |s| puts "  [#{s['name']}] #{s['detail']}" }
end`,
            }}
          />
        </Box>

        {/* POST /classify */}
        <Box id="post-classify" sx={{ scrollMarginTop: '100px', mb: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <Server size={20} color="#2D6A4F" />
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Endpoints
            </Typography>
          </Box>

          <EndpointCard
            method="POST"
            path="/classify"
            description="Envia uma imagem de folha de soja para classificação. Retorna a doença identificada, nível de confiança, severidade e top-K predições. Opcionalmente inclui um plano de ação gerado por IA (GPT-4o) com 3 níveis de detalhamento (essencial, campo, especialista) e fontes de pesquisa utilizadas — quando habilitado, o tempo de resposta pode aumentar em 1-3 segundos."
            parameters={[
              { name: 'image', type: 'file', description: 'Imagem da folha (JPG, PNG, WebP, max 10MB)', required: true },
              { name: 'model', type: 'string', description: 'Modelo: resnet50, efficientnet_b4, vit_b16, ensemble (padrão)', required: false },
              { name: 'top_k', type: 'integer', description: 'Número de predições retornadas (padrão: 5)', required: false },
              { name: 'include_action_plan', type: 'boolean', description: 'Incluir plano de ação gerado por IA na resposta (padrão: false)', required: false },
              { name: 'action_plan_level', type: 'string', description: 'Nível do plano: essencial, campo ou especialista (padrão: essencial). Requer include_action_plan=true', required: false },
            ]}
            responseExample={{
              status: 'success',
              prediction: {
                class_name: 'Ferrugem Asiática',
                scientific_name: 'Phakopsora pachyrhizi',
                confidence: 0.942,
                severity: 'alta',
              },
              top_k: [
                { class_name: 'Ferrugem Asiática', confidence: 0.942 },
                { class_name: 'Mancha Alvo', confidence: 0.031 },
                { class_name: 'Saudável', confidence: 0.018 },
              ],
              action_plan: {
                level: 'essencial',
                actions: [
                  'Aplicar fungicida a base de triazol + estrobilurina imediatamente',
                  'Monitorar a evolução da doença a cada 7 dias',
                  'Registrar a ocorrência no sistema de alerta fitossanitário',
                ],
                sources: [
                  { name: 'EMBRAPA Soja', detail: 'Circular Técnica 104 — Ferrugem Asiática da Soja' },
                  { name: 'Consórcio Antiferrugem', detail: 'Sistema de alerta e monitoramento nacional' },
                  { name: 'PlantVillage - Penn State University', detail: 'Dataset de treinamento dos modelos' },
                ],
              },
              model_used: 'ensemble',
              processing_time_ms: 1842,
            }}
            codeExamples={{
              'cURL': `curl -X POST ${BASE_URL}/classify \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -F "image=@folha_soja.jpg" \\
  -F "model=ensemble" \\
  -F "include_action_plan=true" \\
  -F "action_plan_level=especialista" \\
  -F "top_k=3"`,
              'Python': `import requests

response = requests.post(
    "${BASE_URL}/classify",
    headers={"Authorization": "Bearer YOUR_API_KEY"},
    files={"image": open("folha_soja.jpg", "rb")},
    data={
        "model": "ensemble",
        "include_action_plan": "true",
        "action_plan_level": "especialista",
        "top_k": 3,
    },
)
result = response.json()
print(result["prediction"]["class_name"])
plan = result.get("action_plan", {})
print(f"Nível: {plan.get('level')}")
for src in plan.get("sources", []):
    print(f"  Fonte: {src['name']}")`,
              'JavaScript': `const formData = new FormData();
formData.append('image', file);
formData.append('model', 'ensemble');
formData.append('include_action_plan', 'true');
formData.append('action_plan_level', 'especialista');
formData.append('top_k', '3');

const res = await fetch('${BASE_URL}/classify', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer YOUR_API_KEY' },
  body: formData,
});
const data = await res.json();
console.log(data.prediction);
console.log(data.action_plan.actions);
console.log(data.action_plan.sources);`,
              'Go': `body := &bytes.Buffer{}
w := multipart.NewWriter(body)
part, _ := w.CreateFormFile("image", "folha.jpg")
io.Copy(part, file)
w.WriteField("model", "ensemble")
w.WriteField("include_action_plan", "true")
w.WriteField("action_plan_level", "especialista")
w.WriteField("top_k", "3")
w.Close()

req, _ := http.NewRequest("POST", "${BASE_URL}/classify", body)
req.Header.Set("Authorization", "Bearer YOUR_API_KEY")
req.Header.Set("Content-Type", w.FormDataContentType())
resp, _ := http.DefaultClient.Do(req)`,
              'Ruby': `require 'net/http'
require 'json'

uri = URI("${BASE_URL}/classify")
req = Net::HTTP::Post.new(uri)
req["Authorization"] = "Bearer YOUR_API_KEY"
req.set_form([
  ["image", File.open("folha.jpg")],
  ["model", "ensemble"],
  ["include_action_plan", "true"],
  ["action_plan_level", "especialista"],
  ["top_k", "3"]
], "multipart/form-data")

res = Net::HTTP.start(uri.hostname, uri.port, use_ssl: true) { |h| h.request(req) }
data = JSON.parse(res.body)
data['action_plan']['sources'].each { |s| puts s['name'] }`,
            }}
          />
        </Box>

        {/* GET /models */}
        <Box id="get-models" sx={{ scrollMarginTop: '100px', mb: 6 }}>
          <EndpointCard
            method="GET"
            path="/models"
            description="Lista os modelos de classificação disponíveis e suas métricas de desempenho."
            responseExample={{
              models: [
                { id: 'resnet50', name: 'ResNet-50', accuracy: 0.921, f1_score: 0.918 },
                { id: 'efficientnet_b4', name: 'EfficientNet-B4', accuracy: 0.938, f1_score: 0.935 },
                { id: 'vit_b16', name: 'ViT-B/16', accuracy: 0.945, f1_score: 0.942 },
                { id: 'ensemble', name: 'Ensemble', accuracy: 0.952, f1_score: 0.949 },
              ],
            }}
            codeExamples={{
              'cURL': `curl ${BASE_URL}/models \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
              'Python': `import requests

response = requests.get(
    "${BASE_URL}/models",
    headers={"Authorization": "Bearer YOUR_API_KEY"},
)
for model in response.json()["models"]:
    print(f"{model['name']}: {model['accuracy']:.1%}")`,
              'JavaScript': `const res = await fetch('${BASE_URL}/models', {
  headers: { 'Authorization': 'Bearer YOUR_API_KEY' },
});
const { models } = await res.json();
models.forEach(m => console.log(m.name, m.accuracy));`,
              'Go': `req, _ := http.NewRequest("GET", "${BASE_URL}/models", nil)
req.Header.Set("Authorization", "Bearer YOUR_API_KEY")
resp, _ := http.DefaultClient.Do(req)
defer resp.Body.Close()
// decode response...`,
              'Ruby': `uri = URI("${BASE_URL}/models")
req = Net::HTTP::Get.new(uri)
req["Authorization"] = "Bearer YOUR_API_KEY"
res = Net::HTTP.start(uri.hostname, uri.port, use_ssl: true) { |h| h.request(req) }
puts JSON.parse(res.body)["models"]`,
            }}
          />
        </Box>

        {/* GET /health */}
        <Box id="get-health" sx={{ scrollMarginTop: '100px', mb: 6 }}>
          <EndpointCard
            method="GET"
            path="/health"
            description="Verifica o status do serviço e disponibilidade dos modelos. Não requer autenticação."
            responseExample={{
              status: 'healthy',
              version: '1.0.0',
              models_loaded: 4,
              uptime_seconds: 86400,
            }}
            codeExamples={{
              'cURL': `curl ${BASE_URL}/health`,
              'Python': `import requests
response = requests.get("${BASE_URL}/health")
print(response.json()["status"])`,
              'JavaScript': `const res = await fetch('${BASE_URL}/health');
const { status } = await res.json();
console.log(status); // "healthy"`,
              'Go': `resp, _ := http.Get("${BASE_URL}/health")
defer resp.Body.Close()
// decode response...`,
              'Ruby': `uri = URI("${BASE_URL}/health")
res = Net::HTTP.get_response(uri)
puts JSON.parse(res.body)["status"]`,
            }}
          />
        </Box>

        {/* Error Codes */}
        <Box id="erros" sx={{ scrollMarginTop: '100px', mb: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <AlertTriangle size={20} color="#2D6A4F" />
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Códigos de Erro
            </Typography>
          </Box>
          <Box
            component="table"
            sx={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '0.85rem',
              '& th, & td': {
                textAlign: 'left',
                py: 1.5,
                px: 2,
                borderBottom: '1px solid',
                borderBottomColor: 'divider',
              },
              '& th': {
                fontWeight: 600,
                backgroundColor: 'surface.elevated',
                color: 'text.secondary',
              },
              '& td': {
                backgroundColor: 'surface.sunken',
              },
            }}
          >
            <thead>
              <tr>
                <th>Código</th>
                <th>Descrição</th>
              </tr>
            </thead>
            <tbody>
              {[
                { code: 400, desc: 'Requisição inválida — imagem ausente ou formato não suportado' },
                { code: 401, desc: 'Não autorizado — API key ausente ou inválida' },
                { code: 413, desc: 'Imagem muito grande — máximo 10MB' },
                { code: 422, desc: 'Imagem não contém uma folha identificável' },
                { code: 429, desc: 'Rate limit excedido — aguarde antes de tentar novamente' },
                { code: 500, desc: 'Erro interno do servidor' },
              ].map((err) => (
                <tr key={err.code}>
                  <td>
                    <Chip
                      label={err.code}
                      size="small"
                      sx={{
                        fontFamily: 'monospace',
                        fontWeight: 600,
                        backgroundColor: 'surface.elevated',
                        color: 'text.primary',
                        border: '1px solid',
                        borderColor: 'divider',
                      }}
                    />
                  </td>
                  <td>{err.desc}</td>
                </tr>
              ))}
            </tbody>
          </Box>
        </Box>

        {/* Rate Limiting */}
        <Box id="rate-limiting" sx={{ scrollMarginTop: '100px' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Gauge size={20} color="#2D6A4F" />
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Rate Limiting
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
            A API possui um limite de <strong>100 requisições por minuto</strong> por API key.
            O header <code>X-RateLimit-Remaining</code> indica as requisições restantes.
            Ao exceder o limite, a API retorna status <code>429</code> com o header
            {' '}<code>Retry-After</code> indicando os segundos para aguardar.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default ApiDocsPage;
