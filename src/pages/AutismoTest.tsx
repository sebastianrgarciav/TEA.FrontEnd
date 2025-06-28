import React, { useState } from 'react';
import { Button, TextField, MenuItem, Stepper, Step, StepLabel, Box, Typography, Paper, RadioGroup, FormControlLabel, Radio, Autocomplete } from '@mui/material';
import childrenService from '../services/childrenService';
import Swal from 'sweetalert2';
import autismotestImage from '../assets/autismotest.png';

const apoderadoOpciones = [
    { value: 'Padre', label: 'Padre' },
    { value: 'Madre', label: 'Madre' },
    { value: 'Abuelo/a', label: 'Abuelo/a' },
    { value: 'Apoderado/a', label: 'Apoderado/a' },
    { value: 'otros', label: 'Otros' },
];

const preguntas = [
    'Si usted señala algo que esta del otro lado de la habitación, ¿su hijo(a) mira hacia lo que acaba de señalar? (por ejemplo: si usted señala un juguete o un animal, ¿su hijo(a) mira al juguete o al animal?)',
    '¿Alguna vez se ha preguntado si su hijo(a) es sordo(a)?',
    '¿Su hijo(a) realiza juegos de imaginación o imitación? (Por ejemplo: ¿hace como si bebiera de una taza vacía, habla por teléfono o da de comer a una muñeca o a un peluche?)',
    '¿A su hijo(a) le gusta treparse o subirse a las cosas? (Por ejemplo: juegos del parque como toboganes, subibajas, muebles o escaleras)',
    '¿Su hijo(a) hace movimientos extraños con los dedos cerca de sus ojos? (Por ejemplo: ¿mueve o agita los dedos cerca de sus ojos de manera inusual?)',
    '¿Su hijo(a) señala o indica con el dedo cuando quiere pedir algo o buscar ayuda? (Por ejemplo: señala un alimento o juguete que está fuera de su alcance)',
    '¿Su hijo(a) señala o indica con el dedo cuando quiere mostrarle algo que le llama la atención? (Por ejemplo: señala un avión en el cielo o un camión muy grande en la calle)',
    '¿Su hijo(a) muestra interés por otros niños? (Por ejemplo: ¿mira a otros niños, les sonríe o se acerca a ellos?)',
    '¿Su hijo(a) le muestra cosas acercándolas o levantándolas para que usted vea, no para pedir ayuda, sino solamente para compartirlas con usted? (Por ejemplo: ¿le muestra una flor, un peluche o un carrito?)',
    '¿Su hijo(a) responde cuando usted lo llama por su nombre? (Por ejemplo: ¿su hijo(a) lo mira, le habla o balbucea, o deja de hacer lo que está haciendo para mirarlo cuando usted lo llama?)',
    'Cuando usted le sonríe a su hijo(a), ¿él o ella también le sonríe?',
    '¿A su hijo(a) le molestan mucho los ruidos comunes? (Por ejemplo: ¿grita, llora o se desespera cuando escucha una aspiradora, una licuadora, una moto, la radio, música fuerte u otros ruidos comunes?)',
    '¿Su hijo(a) caminó solo(a), sin apoyo?',
    '¿Su hijo(a) lo mira a los ojos cuando usted le habla, juega con él o ella, o lo viste?',
    '¿Su hijo(a) imita lo que usted hace? (Por ejemplo: decir "chau" con la mano, aplaudir o repetir un ruido gracioso cuando usted lo hace)',
    'Si usted voltea a mirar algo, ¿su hijo(a) también voltea para ver lo que usted está mirando?',
    '¿Su hijo(a) intenta hacer que usted lo mire y le preste atención? Por ejemplo: lo llama o le pide que lo mire, buscando su aprobación)',
    '¿Su hijo(a) le entiende cuando usted le pide que haga algo sin hacerle ningún gesto? (Por ejemplo: entiende, sin que usted señale, cuando le dice "pon el libro encima de la silla" o "trae la mantita")',
    'Si algo le llama la atención a su hijo(a) ¿él o ella mira a usted para ver su reacción? (Por ejemplo: si escucha un ruido extraño o gracioso, o ve un juguete nuevo, ¿lo mira a usted?)',
    '¿Le gustan a su hijo(a) los juegos con movimientos? (Por ejemplo: le gusta que lo columpien o jugar el "caballito" sobre sus rodillas)',
];

// Preguntas donde SI=0, NO=1 (las demás SI=1, NO=0)
const preguntasSiNoInvertido = [0, 2, 3, 5, 6, 7, 8, 9, 10, 12, 13, 14, 15, 16, 17, 18, 19];

function calcularEdadMeses(fechaNacimiento: string) {
    if (!fechaNacimiento) return '';
    const nacimiento = new Date(fechaNacimiento);
    const hoy = new Date();
    let meses = (hoy.getFullYear() - nacimiento.getFullYear()) * 12;
    meses -= nacimiento.getMonth();
    meses += hoy.getMonth();
    if (hoy.getDate() < nacimiento.getDate()) meses--;
    return meses >= 0 ? meses : '';
}

const ipressList = [
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
    'RED PRESTACIONAL ALMENARA'
];

const AutismoTest: React.FC = () => {
    const [showPreview, setShowPreview] = useState(true);
    const [step, setStep] = useState(0);
    const [childData, setChildData] = useState({
        ipress: '',
        dni: '',
        nombre: '',
        fechaNacimiento: '',
    });
    const [apoderadoData, setApoderadoData] = useState({
        parentesco: '',
        nombre: '',
        telefono: '',
    });
    const [respuestas, setRespuestas] = useState<("SI" | "NO" | "")[]>(Array(preguntas.length).fill(""));
    const [showResult, setShowResult] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChildChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setChildData({ ...childData, [e.target.name]: e.target.value });
    };
    const handleApoderadoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setApoderadoData({ ...apoderadoData, [e.target.name]: e.target.value });
    };
    const handleRespuesta = (idx: number, value: "SI" | "NO") => {
        const nuevas = [...respuestas];
        nuevas[idx] = value;
        setRespuestas(nuevas);
    };
    const puntaje = respuestas.reduce((acc, val, idx) => {
        if (!val) return acc;
        if (preguntasSiNoInvertido.includes(idx)) {
            return acc + (val === 'NO' ? 1 : 0);
        } else {
            return acc + (val === 'SI' ? 1 : 0);
        }
    }, 0);

    const edadMeses = calcularEdadMeses(childData.fechaNacimiento);
    const edadValida = typeof edadMeses === 'number' && edadMeses >= 12 && edadMeses <= 30;

    const handleStartTest = () => {
        setShowPreview(false);
    };

    const handleFinish = async () => {
        setLoading(true);
        try {
            // Construir el payload según RegisterWithEvaluationRequest
            const child = {
                Ipress: childData.ipress,
                ChildDNI: childData.dni,
                ChildName: childData.nombre,
                BirthDate: childData.fechaNacimiento,
            };
            const evaluation = {
                Relationship: apoderadoData.parentesco,
                GuardianName: apoderadoData.nombre,
                GuardianPhone: apoderadoData.telefono,
                TotalScore: puntaje,
                EvaluationDate: new Date().toISOString(),
                RiskLevel: '',
            };
            const answers = respuestas.map((r, idx) => ({
                Answer: r,
                Points: preguntasSiNoInvertido.includes(idx)
                    ? (r === 'NO' ? 1 : 0)
                    : (r === 'SI' ? 1 : 0),
                QuestionNumber: idx + 1,
                QuestionText: preguntas[idx],
            }));
            const questions = preguntas.map((q, idx) => ({
                QuestionNumber: idx + 1,
                Text: q,
            }));
            await childrenService.registerWithEvaluation({
                Child: child,
                Evaluation: evaluation,
                Answers: answers,
                Questions: questions,
            });
            Swal.fire('¡Éxito!', 'El test fue registrado correctamente.', 'success');
            setShowResult(false);
            setStep(0);
            setChildData({ ipress: '', dni: '', nombre: '', fechaNacimiento: '' });
            setApoderadoData({ parentesco: '', nombre: '', telefono: '' });
            setRespuestas(Array(preguntas.length).fill(""));
        } catch (e: any) {
            Swal.fire('Advertencia', e?.response?.data?.message || 'No se pudo registrar el test', 'info');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            className="min-h-screen flex flex-col items-center justify-center"
            style={{
                backgroundImage: `url(${autismotestImage})`,
                backgroundSize: 'auto',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                backgroundAttachment: 'fixed',
                minHeight: '100vh',
                width: '100%',
                zIndex: 0,
            }}
        >
            {showPreview ? (
                <Box
                    className="bg-white bg-opacity-90 p-8 rounded-lg shadow-lg text-center max-w-2xl mx-4"
                    style={{ backdropFilter: 'blur(5px)', zIndex: 2 }}
                >
                    <Typography
                        variant="h4"
                        component="h1"
                        className="font-bold text-gray-800 mb-6"
                        style={{
                            textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
                            lineHeight: '1.3',
                            fontSize: '2rem',
                        }}
                    >
                        EVALUACIÓN DE LAS HABILIDADES DEL DESARROLLO EN NIÑOS DE 12 A 30 MESES DE EDAD
                    </Typography>
                    <br/>
                    <Typography
                        variant="body1"
                        className="text-gray-600 mb-8 text-lg"
                        style={{ fontSize: '1.1rem' }}
                    >
                    Estimado asegurado, por favor sírvase a completar la siguiente información de su menor.
                    </Typography>
                    <br/>
                    <Button
                        variant="contained"
                        color="primary"
                        size="large"
                        onClick={handleStartTest}
                        className="px-8 py-3 text-lg font-semibold"
                        style={{
                            background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                            boxShadow: '0 3px 5px 2px rgba(25, 118, 210, .3)',
                        }}
                    >
                        Comenzar
                    </Button>
                </Box>
            ) : (
                <Paper
                    elevation={3}
                    className="w-full max-w-2xl p-6"
                    style={{
                        background: 'rgba(255,255,255,0.92)',
                        backdropFilter: 'blur(4px)',
                        zIndex: 2,
                        margin: '32px 8px',
                    }}
                >
                    <Stepper activeStep={step} alternativeLabel>
                        <Step><StepLabel>Datos del niño</StepLabel></Step>
                        <Step><StepLabel>Datos del apoderado</StepLabel></Step>
                        <Step><StepLabel>Preguntas</StepLabel></Step>
                    </Stepper>
                    {step === 0 && (
                        <Box mt={4} display="flex" flexDirection="column" gap={2}>
                            <Autocomplete
                                options={ipressList}
                                value={childData.ipress}
                                onChange={(_, newValue) => setChildData({ ...childData, ipress: newValue || '' })}
                                renderInput={(params) => (
                                    <TextField {...params} label="Ipress" required fullWidth />
                                )}
                            />
                            <TextField
                                label="DNI del niño"
                                name="dni"
                                value={childData.dni}
                                onChange={e => {
                                    const value = e.target.value.replace(/\D/g, '').slice(0, 8);
                                    setChildData({ ...childData, dni: value });
                                }}
                                fullWidth
                                required
                                inputProps={{ maxLength: 8 }}
                                error={childData.dni.length > 0 && childData.dni.length < 8}
                                helperText={childData.dni.length > 0 && childData.dni.length < 8 ? 'Debe tener 8 dígitos' : ''}
                            />
                            <TextField label="Nombre del niño" name="nombre" value={childData.nombre} onChange={handleChildChange} fullWidth required />
                            <TextField
                                label="Fecha de nacimiento"
                                name="fechaNacimiento"
                                type="date"
                                value={childData.fechaNacimiento}
                                onChange={handleChildChange}
                                fullWidth
                                required
                                InputLabelProps={{ shrink: true }}
                                inputProps={{ max: new Date().toISOString().split('T')[0] }}
                                error={!!childData.fechaNacimiento && new Date(childData.fechaNacimiento) > new Date()}
                                helperText={!!childData.fechaNacimiento && new Date(childData.fechaNacimiento) > new Date() ? 'No puede ser una fecha futura' : ''}
                            />
                            <TextField label="Edad (meses)" value={edadMeses} fullWidth disabled />
                            {!edadValida && childData.fechaNacimiento && (
                                <span style={{ color: 'red', fontSize: 14 }}>
                                    La edad del niño debe estar entre 12 y 30 meses para realizar el test.
                                </span>
                            )}
                            <Box display="flex" justifyContent="flex-end" mt={2}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => setStep(1)}
                                    disabled={!(childData.ipress && childData.dni.length === 8 && childData.nombre && childData.fechaNacimiento && new Date(childData.fechaNacimiento) <= new Date() && edadValida)}
                                >
                                    Siguiente
                                </Button>
                            </Box>
                        </Box>
                    )}
                    {step === 1 && (
                        <Box mt={4} display="flex" flexDirection="column" gap={2}>
                            <TextField select label="Parentesco" name="parentesco" value={apoderadoData.parentesco} onChange={handleApoderadoChange} fullWidth required>
                                {apoderadoOpciones.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
                            </TextField>
                            <TextField label="Nombre del apoderado" name="nombre" value={apoderadoData.nombre} onChange={handleApoderadoChange} fullWidth required />
                            <TextField
                                label="Teléfono del apoderado"
                                name="telefono"
                                value={apoderadoData.telefono}
                                onChange={e => {
                                    const value = e.target.value.replace(/\D/g, '').slice(0, 9);
                                    setApoderadoData({ ...apoderadoData, telefono: value });
                                }}
                                fullWidth
                                required
                                inputProps={{ maxLength: 9 }}
                                error={apoderadoData.telefono.length > 0 && apoderadoData.telefono.length < 9}
                                helperText={apoderadoData.telefono.length > 0 && apoderadoData.telefono.length < 9 ? 'Debe tener 9 dígitos' : ''}
                            />
                            <Box display="flex" justifyContent="space-between" mt={2}>
                                <Button variant="outlined" color="primary" onClick={() => setStep(0)}>Atrás</Button>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => setStep(2)}
                                    disabled={!(apoderadoData.parentesco && apoderadoData.nombre && apoderadoData.telefono.length === 9)}
                                >
                                    Siguiente
                                </Button>
                            </Box>
                        </Box>
                    )}
                    {step === 2 && (
                        <Box mt={4}>
                            {preguntas.map((preg, idx) => (
                                <Box key={idx} mb={2}>
                                    <Typography fontWeight={500}>{idx + 1}. {preg}</Typography>
                                    <RadioGroup row value={respuestas[idx]} onChange={e => handleRespuesta(idx, e.target.value as "SI" | "NO")}
                                        name={`pregunta-${idx}`}
                                    >
                                        <FormControlLabel value="SI" control={<Radio color="primary" />} label="SI" />
                                        <FormControlLabel value="NO" control={<Radio color="primary" />} label="NO" />
                                    </RadioGroup>
                                </Box>
                            ))}
                            <Box display="flex" justifyContent="space-between" mt={4}>
                                <Button variant="outlined" color="primary" onClick={() => setStep(1)}>Atrás</Button>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleFinish}
                                    disabled={respuestas.some(r => !r) || loading}
                                >
                                    {loading ? 'Guardando...' : 'Finalizar'}
                                </Button>
                            </Box>
                        </Box>
                    )}
                </Paper>
            )}
        </Box>
    );
};

export default AutismoTest; 