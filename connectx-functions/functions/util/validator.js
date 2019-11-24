const isEmail=(email)=>{
    //expression to check whether the email is a regular expression email or not
    const emailRegEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if(email.match(emailRegEx))
     return true
    else 
    return false 
}
const isEmpty=(string)=>{
    if(string.trim()==='')
     return true;
     else 
     return false;
}
exports.validateSignUp=(data)=>{
    let errors={}
    //all else and if statements
    if(isEmpty(data.email))  errors.email="email must not be empty"
    else if(!isEmail(data.email))  errors.email="email is not a valid one Proceed once again"

    if(isEmpty(data.password))  errors.password="Password cannot be empty";
     
    if(data.password!==data.confirmPassword) errors.confirmation="passwords didn't match";
 
    if(isEmpty(data.handle)) errors.handle="please enter handle to specify the data allocation";

    
    return{
        errors,
        valid: Object.keys(errors).length === 0 ? true:false
    }

}
exports.validateLogin=(data)=>{
    const errors={}
    if(isEmpty(data.email)) errors.email="email cannot be empty";
    else if(!isEmail(data.email)) errors.email="email is not valid";

    if(isEmpty(data.password)) errors.password="Password cannot be a Empty field";

    return {
        errors,
        valid : Object.keys(errors).length === 0 ? true:false
    }
   
}