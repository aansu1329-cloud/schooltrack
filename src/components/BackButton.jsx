export default function BackButton({ onBack }){
  return (
    <button 
      onClick={onBack} 
      style={{
        width:40, 
        height:40, 
        borderRadius:12, 
        background:'#1A2236', 
        border:'1px solid #2A3552', 
        color:'white',
        fontSize:18,
        cursor:'pointer'
      }}
    >
      ‹
    </button>
  )
}