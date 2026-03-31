import React from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { UserRound, Camera, Upload, Brain, Search, Sparkles, FileCheck } from 'lucide-react';
import { useTheme } from '@mui/material/styles';

const iconMap = {
  user: UserRound,
  camera: Camera,
  upload: Upload,
  brain: Brain,
  search: Search,
  sparkles: Sparkles,
  filecheck: FileCheck,
};

function FlowNode({ data }) {
  const theme = useTheme();
  const Icon = iconMap[data.icon];
  const nodeBackgroundColor = theme.palette.surface.sunken;
  const nodeBorderColor = theme.palette.divider;
  const nodeTitleColor = theme.palette.text.primary;
  const nodeDescriptionColor = theme.palette.text.secondary;

  return (
    <Box
      sx={{
        backgroundColor: nodeBackgroundColor,
        borderRadius: 3,
        border: `1px solid ${nodeBorderColor}`,
        borderTop: `4px solid ${data.color}`,
        p: 2,
        width: 170,
        textAlign: 'center',
        boxShadow: theme.palette.mode === 'dark' ? '0 4px 14px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.06)',
        position: 'relative',
      }}
    >
      <Handle type="target" position={Position.Left} id="left-target" style={{ visibility: 'hidden', width: 1, height: 1 }} />
      <Handle type="source" position={Position.Left} id="left-source" style={{ visibility: 'hidden', width: 1, height: 1 }} />
      <Handle type="target" position={Position.Right} id="right-target" style={{ visibility: 'hidden', width: 1, height: 1 }} />
      <Handle type="source" position={Position.Right} id="right-source" style={{ visibility: 'hidden', width: 1, height: 1 }} />
      <Handle type="target" position={Position.Top} id="top-target" style={{ visibility: 'hidden', width: 1, height: 1 }} />
      <Handle type="source" position={Position.Top} id="top-source" style={{ visibility: 'hidden', width: 1, height: 1 }} />
      <Handle type="target" position={Position.Bottom} id="bottom-target" style={{ visibility: 'hidden', width: 1, height: 1 }} />
      <Handle type="source" position={Position.Bottom} id="bottom-source" style={{ visibility: 'hidden', width: 1, height: 1 }} />
      {data.step && (
        <Box
          sx={{
            position: 'absolute',
            top: -12,
            left: -10,
            width: 26,
            height: 26,
            borderRadius: '50%',
            backgroundColor: data.color,
            color: '#FFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.7rem',
            fontWeight: 700,
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
          }}
        >
          {data.step}
        </Box>
      )}
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: '50%',
          backgroundColor: `${data.color}15`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mx: 'auto',
          mb: 1,
        }}
      >
        {Icon && <Icon size={22} color={data.color} />}
      </Box>
      <Typography
        variant="subtitle2"
        sx={{ fontWeight: 600, fontSize: '0.8rem', lineHeight: 1.3, mb: 0.5, color: nodeTitleColor }}
      >
        {data.label}
      </Typography>
      <Typography
        variant="caption"
        sx={{ color: nodeDescriptionColor, fontSize: '0.65rem', lineHeight: 1.3, display: 'block' }}
      >
        {data.description}
      </Typography>
    </Box>
  );
}

const nodeTypes = { flowNode: FlowNode };

function FlowLabelEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  markerEnd,
  data,
  animated,
}) {
  const theme = useTheme();
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={style}
        markerEnd={markerEnd}
        className={animated ? 'animated' : undefined}
      />
      <EdgeLabelRenderer>
        <Box
          sx={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            px: 1,
            py: 0.35,
            borderRadius: 1,
            fontSize: '0.67rem',
            fontWeight: 600,
            color: theme.palette.text.primary,
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            pointerEvents: 'none',
            zIndex: 1000,
            whiteSpace: 'nowrap',
          }}
        >
          {data?.label}
        </Box>
      </EdgeLabelRenderer>
    </>
  );
}

const edgeTypes = { flowLabelEdge: FlowLabelEdge };

const initialNodes = [
  {
    id: 'user',
    type: 'flowNode',
    position: { x: 0, y: 75 },
    data: { label: 'Produtor Rural', description: 'Qualquer produtor, de qualquer porte', icon: 'user', color: '#2D6A4F' },
  },
  {
    id: 'photo',
    type: 'flowNode',
    position: { x: 230, y: 0 },
    data: { label: 'Captura', description: 'Foto da folha pelo celular', icon: 'camera', color: '#52B788', step: '1' },
  },
  {
    id: 'upload',
    type: 'flowNode',
    position: { x: 460, y: 0 },
    data: { label: 'Envio', description: 'Via Chat ou API RESTful', icon: 'upload', color: '#52B788', step: '2' },
  },
  {
    id: 'deeplearning',
    type: 'flowNode',
    position: { x: 690, y: 0 },
    data: { label: 'Deep Learning', description: 'ResNet-50, EfficientNet, ViT', icon: 'brain', color: '#F4A261', step: '3' },
  },
  {
    id: 'classification',
    type: 'flowNode',
    position: { x: 690, y: 180 },
    data: { label: 'Classificação', description: 'Doença + confiança + severidade', icon: 'search', color: '#E63946', step: '4' },
  },
  {
    id: 'llm',
    type: 'flowNode',
    position: { x: 460, y: 180 },
    data: { label: 'LLM (GPT-4o)', description: 'Plano de ação personalizado', icon: 'sparkles', color: '#7C3AED', step: '5' },
  },
  {
    id: 'result',
    type: 'flowNode',
    position: { x: 230, y: 180 },
    data: { label: 'Diagnóstico', description: 'Resultado + recomendações', icon: 'filecheck', color: '#2D6A4F', step: '6' },
  },
];

const initialEdges = [
  { id: 'e0', source: 'user', target: 'photo', sourceHandle: 'right-source', targetHandle: 'left-target', type: 'flowLabelEdge', animated: true, style: { stroke: '#2D6A4F', strokeWidth: 2 }, data: { label: 'Tira foto' }, zIndex: 10 },
  { id: 'e1', source: 'photo', target: 'upload', sourceHandle: 'right-source', targetHandle: 'left-target', type: 'smoothstep', animated: true, style: { stroke: '#52B788', strokeWidth: 2 } },
  { id: 'e2', source: 'upload', target: 'deeplearning', sourceHandle: 'right-source', targetHandle: 'left-target', type: 'smoothstep', animated: true, style: { stroke: '#52B788', strokeWidth: 2 } },
  { id: 'e3', source: 'deeplearning', target: 'classification', sourceHandle: 'bottom-source', targetHandle: 'top-target', type: 'smoothstep', animated: true, style: { stroke: '#F4A261', strokeWidth: 2 } },
  { id: 'e4', source: 'classification', target: 'llm', sourceHandle: 'left-source', targetHandle: 'right-target', type: 'smoothstep', animated: true, style: { stroke: '#E63946', strokeWidth: 2 } },
  { id: 'e5', source: 'llm', target: 'result', sourceHandle: 'left-source', targetHandle: 'right-target', type: 'smoothstep', animated: true, style: { stroke: '#7C3AED', strokeWidth: 2 } },
  { id: 'e6', source: 'result', target: 'user', sourceHandle: 'bottom-source', targetHandle: 'bottom-target', type: 'flowLabelEdge', animated: false, style: { stroke: '#2D6A4F', strokeWidth: 1.5, strokeDasharray: '6 3' }, data: { label: 'Recebe diagnóstico' }, zIndex: 10 },
];

function ApplicationFlowGraph() {
  const theme = useTheme();
  
  const [nodes] = useNodesState(initialNodes);
  const [edges] = useEdgesState(initialEdges);

  return (
    <Box
      sx={{
        width: '100%',
        height: 450,
        position: 'relative',
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        backgroundColor: 'background.default',
        overflow: 'hidden',
        '& .react-flow__controls': {
          backgroundColor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: theme.palette.mode === 'dark' ? '0 4px 14px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.08)',
          borderRadius: 10,
          overflow: 'hidden',
        },
        '& .react-flow__controls-button': {
          backgroundColor: 'background.paper',
          borderBottom: '1px solid',
          borderBottomColor: 'divider',
          color: 'text.primary',
          transition: 'background-color 0.2s ease',
        },
        '& .react-flow__controls-button:last-child': {
          borderBottom: 'none',
        },
        '& .react-flow__controls-button:hover': {
          backgroundColor: 'action.hover',
        },
        '& .react-flow__controls-button svg': {
          fill: 'currentColor',
        },
      }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        zoomOnScroll={false}
        zoomOnPinch={false}
        panOnDrag={false}
        preventScrolling={false}
        proOptions={{ hideAttribution: true }}
      >
        <Background color={theme.palette.divider} gap={20} size={1} />
        <Controls
          showInteractiveButton={false}
          showZoom={true}
          showFitView={true}
          position="bottom-right"
        />
      </ReactFlow>
    </Box>
  );
}

export default ApplicationFlowGraph;
