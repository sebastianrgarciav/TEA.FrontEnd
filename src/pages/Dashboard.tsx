import React, { useState, useEffect, useMemo } from 'react';
import {
  Chart as ChartJS,
  ChartData,
  ChartOptions,
  registerables,
} from 'chart.js';
import { Chart as ChartComponent, Bar } from 'react-chartjs-2';
// @ts-ignore  – el plugin no tiene tipos en DefinitelyTyped
import ChartDataLabels from 'chartjs-plugin-datalabels';
import Slider from '@mui/material/Slider';
import Pagination from '@mui/material/Pagination';
import List from '@mui/material/List';
import ListItem from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';

import childrenService from '../services/childrenService';

/* ---------- registrar Chart.js y el plugin ---------- */
ChartJS.register(...registerables, ChartDataLabels);

/* ───────── LISTA DE IPRESS ───────── */
const IpressList = [
  'HOSPITAL I JORGE VOTO BERNALES CORPANCHO',
  'HOSPITAL II CLINICA GERIATRICA SAN ISIDRO LABRADOR',
  'HOSPITAL II RAMON CASTILLA',
  'HOSPITAL II VITARTE',
  'HOSPITAL I AURELIO DIAZ UFANO Y PERAL',
  'HOSPITAL III EMERGENCIAS GRAU',
  'POLICLINICO CHOSICA',
  'POLICLINICO DE COMPLEJIDAD CRECIENTE SAN LUIS',
  'POLICLINICO FRANCISCO PIZARRO',
  'CAP III EL AGUSTINO',
  'CAP III ALFREDO PIAZZA ROBERTS',
  'CAP III HUAYCAN',
  'CAP III INDEPENDENCIA',
  'CAP III SAN BORJA',
  'CENTRO MEDICO ANCJIE',
  'CENTRO MEDICO CASAPALCA',
  'POSTA MEDICA CONSTRUCCION CIVIL',
  'RED PRESTACIONAL ALMENARA',
];

/* ───────── COMPONENTE ───────── */
const Dashboard: React.FC = () => {
  /* -------- configuración inicial -------- */
  const role = sessionStorage.getItem('role') || '';
  const allIpress = IpressList;
  const userIpress =
    sessionStorage.getItem('ipress')?.split('\n').map(c=>c.trim()).filter(c=>c) || [];

  const [ipressListState] = useState<string[]>(
    role === 'Administrador' || role === 'Monitor'
      ? allIpress : userIpress
  );
  const [selectedIpress, setSelectedIpress] = useState<string[]>(ipressListState);

  /* -------- rango de puntaje -------- */
  const [range, setRange]   = useState<[number, number]>([0, 20]);
  const [minInput,setMinInput] = useState('0');
  const [maxInput,setMaxInput] = useState('20');
  const resetRange = () => { setRange([0,20]); setMinInput('0'); setMaxInput('20'); };

  /* -------- paginación & resumen -------- */
  const [page,setPage]      = useState(1);
  const rowsPerPage         = 5;
  const [summary,setSummary]= useState<any>(null);
  const [loading,setLoading]= useState(false);

  /* -------- tema -------- */
  const theme = createTheme({ palette:{ primary:{ main:'#023e8a' } } });

  /* -------- helpers selección -------- */
  const allIpressSelected = selectedIpress.length === ipressListState.length;
  const toggleSelectAllIpress = () =>
    setSelectedIpress(allIpressSelected ? [] : ipressListState);

  const toggleIpress = (c:string) =>
    setSelectedIpress(prev => prev.includes(c) ? prev.filter(x=>x!==c) : [...prev,c]);

  /* -------- inputs rango de puntaje -------- */
  const numberRegex = /^(\d{0,2}(\.\d{0,2})?)?$/;
  const commitMin = () => {
    const n = parseFloat(minInput);
    if (!isNaN(n) && n>=0 && n<=range[1] && n<=20) setRange([n,range[1]]); else setMinInput(range[0].toString());
  };
  const commitMax = () => {
    const n = parseFloat(maxInput);
    if (!isNaN(n) && n>=range[0] && n<=20) setRange([range[0],n]); else setMaxInput(range[1].toString());
  };
  const syncInputs = ([min,max]:[number,number]) => {
    setRange([min,max]);
    setMinInput(min.toFixed(2).replace(/\.?0+$/,''));
    setMaxInput(max.toFixed(2).replace(/\.?0+$/,''));
  };

  /* -------- reiniciar página -------- */
  useEffect(()=>{ setPage(1); },[selectedIpress,range]);

  /* -------- fetch datos -------- */
  useEffect(() => {
    if (selectedIpress.length === 0) {
      setSummary(null);
      return;
    }
    const fetchSummary = async () => {
      setLoading(true);
      try {
        const filters = {
          Ipress: selectedIpress,
          MinScore: range[0].toString(),
          MaxScore: range[1].toString()
        };
        const summaryPage = {
          Page: page,
          PageSize: rowsPerPage,
          Filters: filters
        };
        const res = await childrenService.getAutismoSummary(summaryPage);
        if (res.data.success) {
          setSummary(res.data);
        } else {
          console.error('Error en la respuesta del servidor:', res.data.message);
          setSummary(null);
        }
      } catch (err) {
        console.error('Error al obtener el resumen:', err);
        setSummary(null);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, [page, selectedIpress, range]);

  /* -------- datos -------- */
  const {
    total = 0,
    lowRisk = 0,
    moderateRisk = 0,
    highRisk = 0,
    children: childrenRows = [],
    establishCounts: establishObj = {}
  } = summary?.message || {};
  const totalPages = Math.ceil(total/rowsPerPage);

  /* -------- calcular riesgos -------- */
  const bajoRiesgo = lowRisk;
  const moderadoRiesgo = moderateRisk;
  const altoRiesgo = highRisk;

  /* -------- chart helpers -------- */
  const commonDatalabels = { display:(ctx:any)=>(ctx.dataset.data[ctx.dataIndex] as number)>0,
    anchor:'end',align:'start',formatter:(v:number)=>v,font:{weight:'bold'} } as any;

  /* ---- gráfica por riesgo ---- */
  const riskData = [bajoRiesgo, moderadoRiesgo, altoRiesgo];
  const riskLabels = ['Riesgo Bajo', 'Riesgo Moderado', 'Riesgo Alto'];
  const riskColors = ['#023e8a', '#FF9800', '#F44336'];
  
  const riskBarData:ChartData<'bar',number[],string> = {
    labels: riskLabels,
    datasets:[
      { type:'bar',label:'N° de niños',data:riskData,backgroundColor:riskColors,
        datalabels:{display:(ctx:any)=>ctx.dataset.data[ctx.dataIndex]>0,anchor:'center',align:'center',color:'#fff',formatter:(v:any)=>v,font:{weight:'bold'}}},
    ],
  };
  const riskBarOptions:ChartOptions<'bar'> = {
    responsive:true,maintainAspectRatio:false,
    plugins:{legend:{display:true},datalabels:{display:false}},
    scales:{
      y:{
        beginAtZero:true,
        ticks:{precision:0,stepSize:1},
        title:{display:window.innerWidth > 768,text:'Cantidad de niños'}
      },
      x:{title:{display:true,text:'Nivel de Riesgo'}}
    },
  };

  /* ---- gráfica por IPRESS ---- */
  const allIpressForChart = [...ipressListState].sort((a,b)=>a.localeCompare(b,'es',{sensitivity:'base'}));
  const estCounts = allIpressForChart.map(c=>establishObj[c]??0);
  const estBarData = { labels:allIpressForChart, datasets:[{label:'N° de niños',data:estCounts,backgroundColor:'#023e8a'}] };
  const estBarOptions:ChartOptions<'bar'> = {
    indexAxis:'y',responsive:true,maintainAspectRatio:false,
    plugins:{legend:{display:false},datalabels:{...commonDatalabels,anchor:'end',align:'right'}},
    scales:{
      x:{
        beginAtZero:true,
        ticks:{precision:0,stepSize:1},
        suggestedMax:Math.max(...estCounts)+1,
        title:{display:true,text:'Cantidad de niños'}
      },
      y:{
        title:{display:window.innerWidth > 768,text:'IPRESS'}
      }
    },
  };

  /* ───────────────── RENDER ───────────────── */
  return (
    <ThemeProvider theme={theme}>
      <div className="h-screen flex flex-col overflow-hidden">
        <div className="flex flex-1 overflow-hidden">

          {/* ---------- SIDEBAR DESKTOP ---------- */}
          <aside className="hidden md:flex w-60 bg-white shadow-2xl mt-20 flex-shrink-0 flex-col">
            <div className="px-4 py-4">
              <h2 className="font-bold text-base text-[#023e8a] mb-2 border-b pb-2">
                IPRESS
              </h2>
              <button
                onClick={toggleSelectAllIpress}
                className="mt-2 text-xs px-3 py-1 rounded text-white"
                style={{ backgroundColor: '#023e8a' }}
              >
                {allIpressSelected ? 'Deseleccionar todos' : 'Seleccionar todos'}
              </button>
            </div>

            <div className="px-2 overflow-y-auto" style={{ maxHeight: '800px' }}>
              <Accordion disableGutters square defaultExpanded={false}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <span className="font-semibold text-[#023e8a] flex-1">Seleccionar IPRESS</span>
                </AccordionSummary>
                <AccordionDetails className="px-0">
                  <List dense>
                    {ipressListState.map(c => (
                      <ListItem key={c} disablePadding>
                        <ListItemButton onClick={()=>toggleIpress(c)}>
                          <Checkbox edge="start" color="primary"
                            checked={selectedIpress.includes(c)} tabIndex={-1} disableRipple />
                          <ListItemText primary={c} />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>
            </div>
          </aside>

          {/* ---------- MAIN ---------- */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 mt-20 space-y-6">

            {/* ---------- TARJETAS + SLIDER ---------- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
              {/* tarjetas */}
              <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-2xl text-center">
                <p className="text-xs sm:text-sm font-medium text-[#023e8a]">TOTAL DE NIÑOS</p>
                <p className="text-2xl sm:text-3xl font-bold text-[#023e8a]">
                  {loading ? '...' : (total || 0)}
                </p>
              </div>
              <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-2xl text-center">
                <p className="text-xs sm:text-sm font-medium text-[#023e8a]">BAJO RIESGO</p>
                <p className="text-2xl sm:text-3xl font-bold text-green-500">
                  {loading ? '...' : (bajoRiesgo || 0)}
                </p>
              </div>
              <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-2xl text-center">
                <p className="text-xs sm:text-sm font-medium text-[#023e8a]">MODERADO RIESGO</p>
                <p className="text-2xl sm:text-3xl font-bold text-orange-500">
                  {loading ? '...' : (moderadoRiesgo || 0)}
                </p>
              </div>
              <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-2xl text-center">
                <p className="text-xs sm:text-sm font-medium text-[#023e8a]">ALTO RIESGO</p>
                <p className="text-2xl sm:text-3xl font-bold text-red-500">
                  {loading ? '...' : (altoRiesgo || 0)}
                </p>
              </div>

              {/* card slider */}
              <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-2xl
                              sm:col-span-2 lg:col-span-2 flex flex-col gap-3">
                <div className="flex items-center flex-wrap gap-2">
                  <span className="font-semibold text-[#023e8a] whitespace-nowrap">
                    RANGO DE PUNTAJE
                  </span>
                  <Tooltip title="Restablecer a 0 – 20">
                    <IconButton size="small" color="primary" onClick={resetRange}>
                      <RefreshIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <span className="flex items-center gap-1 text-sm">
                    [
                    <TextField
                      value={minInput}
                      onChange={e=>numberRegex.test(e.target.value)&&setMinInput(e.target.value)}
                      onBlur={commitMin}
                      variant="standard" size="small" className="w-14"
                      inputProps={{ inputMode:'decimal', style:{textAlign:'center'} }}
                    />
                    –
                    <TextField
                      value={maxInput}
                      onChange={e=>numberRegex.test(e.target.value)&&setMaxInput(e.target.value)}
                      onBlur={commitMax}
                      variant="standard" size="small" className="w-14"
                      inputProps={{ inputMode:'decimal', style:{textAlign:'center'} }}
                    />
                    ]
                  </span>
                </div>
                <Slider
                  value={range} min={0} max={20} step={0.01}
                  onChange={(_,v)=>syncInputs(v as [number,number])}
                  color="primary" disableSwap
                />
              </div>
            </div>

            {/* ---------- SELECCIÓN IPRESS MÓVIL ---------- */}
            <div className="block md:hidden">
              <button
                onClick={toggleSelectAllIpress}
                className="mb-2 text-xs px-3 py-1 rounded text-white"
                style={{ backgroundColor: '#023e8a' }}
              >
                {allIpressSelected ? 'Deseleccionar todos' : 'Seleccionar todos'}
              </button>

              <div className="space-y-2">
                <Accordion disableGutters square defaultExpanded={false}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <span className="font-semibold text-[#023e8a] flex-1">Seleccionar IPRESS</span>
                  </AccordionSummary>
                  <AccordionDetails className="px-0">
                    <List dense>
                      {ipressListState.map(c=>(
                        <ListItem key={c} disablePadding>
                          <ListItemButton onClick={()=>toggleIpress(c)}>
                            <Checkbox edge="start" color="primary"
                              checked={selectedIpress.includes(c)} tabIndex={-1} disableRipple />
                            <ListItemText primary={c} />
                          </ListItemButton>
                        </ListItem>
                      ))}
                    </List>
                  </AccordionDetails>
                </Accordion>
              </div>
            </div>

            {/* ---------- GRID PRINCIPAL ---------- */}
            <div className="grid gap-6 md:gap-8 md:grid-cols-2 md:auto-rows-min">
              <section className="bg-white p-4 sm:p-6 rounded-xl shadow-2xl w-full">
                <h2 className="text-base sm:text-lg font-semibold mb-2 sm:mb-4 text-[#023e8a]">
                  CANTIDAD DE NIÑOS POR RIESGO
                </h2>
                <div className="h-[14rem] sm:h-64 w-full overflow-x-auto">
                  {loading ? (
                    <div className="flex justify-center items-center h-full">
                      <p className="text-gray-500">Cargando gráfico...</p>
                    </div>
                  ) : (
                    <ChartComponent type="bar" data={riskBarData} options={riskBarOptions} />
                  )}
                </div>
              </section>

              <section className="bg-white p-4 sm:p-6 rounded-xl shadow-2xl w-full flex flex-col
                                   md:row-span-2 md:col-start-2 md:row-start-1">
                <h2 className="text-base sm:text-lg font-semibold mb-2 sm:mb-4 text-[#023e8a] text-center">
                  CANTIDAD DE NIÑOS POR IPRESS
                </h2>
                <div className="flex-1 h-[14rem] sm:h-full overflow-x-auto">
                  {loading ? (
                    <div className="flex justify-center items-center h-full">
                      <p className="text-gray-500">Cargando gráfico...</p>
                    </div>
                  ) : (
                    <Bar data={estBarData} options={estBarOptions} />
                  )}
                </div>
              </section>

              <section className="bg-white p-4 sm:p-6 rounded-xl shadow-2xl w-full">
                <h2 className="text-base sm:text-lg font-semibold mb-2 sm:mb-4 text-[#023e8a]">
                  LISTADO DE NIÑOS FILTRADOS
                </h2>
                <div className="overflow-x-auto max-h-80">
                  {loading ? (
                    <div className="flex justify-center items-center h-32">
                      <p className="text-gray-500">Cargando datos...</p>
                    </div>
                  ) : childrenRows.length === 0 ? (
                    <div className="flex justify-center items-center h-32">
                      <p className="text-gray-500">No se encontraron niños con los filtros aplicados</p>
                    </div>
                  ) : (
                    <table className="w-full text-left border border-gray-200 sm:min-w-[620px]">
                      <thead className="bg-gray-50">
                        <tr className="text-[#023e8a] text-xs sm:text-sm">
                          <th className="p-2 sm:p-3 border">NOMBRE DEL NIÑO</th>
                          <th className="p-2 sm:p-3 border">NOMBRE DEL APODERADO</th>
                          <th className="p-2 sm:p-3 border">CELULAR DEL APODERADO</th>
                          <th className="p-2 sm:p-3 border">NÚMERO DE EVALUACIÓN</th>
                          <th className="p-2 sm:p-3 border">FECHA DE LA EVALUACIÓN</th>
                          <th className="p-2 sm:p-3 border">PUNTAJE</th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-700 text-xs sm:text-sm">
                        {childrenRows.map((ch: any, i: number)=>(
                          <tr key={i} className="border">
                            <td className="p-2 sm:p-3 border">{ch.name}</td>
                            <td className="p-2 sm:p-3 border">{ch.guardianName}</td>
                            <td className="p-2 sm:p-3 border">{ch.guardianPhone}</td>
                            <td className="p-2 sm:p-3 border">{ch.evaluationNumber}</td>
                            <td className="p-2 sm:p-3 border">{ch.evaluationDate}</td>
                            <td className="p-2 sm:p-3 border">{ch.score}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
                {!loading && childrenRows.length > 0 && (
                  <div className="flex justify-center mt-3 sm:mt-4">
                    <Pagination
                      count={totalPages}
                      page={page}
                      onChange={(_,v)=>setPage(v)}
                      size="small"
                      color="primary"
                    />
                  </div>
                )}
              </section>
            </div>
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default Dashboard;
