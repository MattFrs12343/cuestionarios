import { definitions } from '../MotorManeuvers/definitions';
import { ManeuverInstructions, ManeuverResults } from '../MotorManeuvers/Fields';
export { default as PatientDetails } from '../MotorManeuvers/PatientDetails';
export function Instructions() { return <ManeuverInstructions definition={definitions.wartenberg} />; }
export function Results(props) { return <ManeuverResults {...props} definition={definitions.wartenberg} />; }
