import React from 'react'

interface Props {
    title?: string;
    titleClassName?: string;
    color?: string;
    mainClassName?: string;
}

const Button = (props: Props) => {
    return (
        <div className={`${props.mainClassName} w-52 h-16 flex items-center justify-center rounded-xl cursor-pointer`}>
            <p className={`${props.titleClassName} text-lg text-textColor`}>{props.title}</p>
        </div>
    )
}

export default Button