
class resp<T=unknown>{
    success:boolean;
    msg:string;
    data:T;

    public constructor(success:boolean,msg:string,data:T){
        this.success=success;
        this.msg=msg;
        this.data=data;
    }
}

module.exports=resp