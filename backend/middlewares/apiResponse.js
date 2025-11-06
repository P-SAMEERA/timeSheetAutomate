export default class apiResponse{
    constructor(code,msg,data){
        this.statusCode = code;
        this.message = msg;
        this.status = code >=400? "Fail":"Success";
        this.payload = data;
    }
}