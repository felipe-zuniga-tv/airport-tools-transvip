import { UserIcon } from "lucide-react"
import Image from "next/image"
import Zoom from 'react-medium-image-zoom'
import 'react-medium-image-zoom/dist/styles.css'

export default function DriverAvatar({ url, alt } : { 
    url: string, alt: string 
}) {
    return (
        url !== '' && url ? 
            <Zoom>
                <Image src={url}
                    width={400} height={400}
                    className='h-12 w-12 md:h-16 md:w-16 shadow-md object-cover rounded-full' 
                    alt={alt}
                    /> 
            </Zoom>
            : <UserIcon className='size-12 rounded-full shadow-md bg-gray-100 text-black p-2' />
    )
}