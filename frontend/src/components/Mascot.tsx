import './Mascot.css'

interface MascotProps {
  state: string
}

export default function Mascot({ state }: MascotProps) {
  const stateClass = `mascot--${state.toLowerCase()}`

  return (
    <div className={`mascot ${stateClass}`}>
      <img src="/assets/body.png" className="mascot__layer mascot__layer--body" alt="" />
      <img src="/assets/tail.png" className="mascot__layer mascot__layer--tail" alt="" />
      <img src="/assets/top.png" className="mascot__layer mascot__layer--top" alt="" />
      <img src="/assets/hair.png" className="mascot__layer mascot__layer--hair" alt="" />
      <img src="/assets/eyes-mouth.png" className="mascot__layer mascot__layer--eyes" alt="" />
    </div>
  )
}
