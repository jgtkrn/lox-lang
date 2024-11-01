export const error = (line: number, message: string, index: number | null = null) => {
    report(line, '', message, index);
}

export const report = (line: number, where: string, message: string, index: number | null = null) => {
    if(index) {
        console.log(`[line ${line},${index}] Error ${where}: ${message}`);
    } else {
        console.log(`[line ${line}] Error ${where}: ${message}`);
    }
}