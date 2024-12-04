import Link from "next/link";

export default function EmailLink({ address } : {
    address: string
}) {
    return (
        <Link href={`mailto:${address}`} className='hover:underline'>
            <span>{address}</span>
        </Link>
    )
}