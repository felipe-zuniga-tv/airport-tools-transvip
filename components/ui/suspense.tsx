export default function SuspenseLoading({ text } : { text? : string }) {
    return (
        <div className='min-h-screen flex justify-center items-center animate-pulse text-xl text-white p-16 rounded-md'>
            {text || 'Cargando...'}
        </div>
    )
}
