export default generateBarcodeNumber=()=>{
    const code = Date.now().toString() + (Math.ceil(Math.random() * 10)).toString()
    return code;
}