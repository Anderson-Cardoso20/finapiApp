const { request } = require('express');
const express = require ('express');
const { v4:uuidv4 } = require ("uuid")

const app = express();

app.use(express.json())

const customers = []; 



function verifyIfExistsAccountCPF(request, response, next){
    const {cpf} = request.headers;
    const customer = customers.find(customer => customer.cpf === cpf);

    if(!customer){
    return response.status(400).json({error: "customer not found"})
    }

    request.customer = customer;

    return next();
}


function getBalance(statemet){
    const balance = statemet.reduce((acc, operation)=>{
        if(operation.type === 'credit'){
            return acc + operation.amount;
        }else {
            return acc -operation.amount;
        }
    }, 0);

    return balance;
}



app.post("/account", (request, response)=>{
    
    //parâmetros utilizados para cadastro do cliente
    const {cpf, name} = request.body;
    
    //função para checar se já existe um cliente cadastrado com mesmo cpf requisitado
    const customerAlreadyExists = customers.some((customer) =>customer.cpf ===cpf);

    if(customerAlreadyExists){
        return response.status(400).json({error: "Customer already exists"})
    }
      
    customers.push({
        cpf,
        name,
        id: uuidv4(),
        statement: []
    });

    return response.status(201).send()

})


app.get("/statement", verifyIfExistsAccountCPF, (request, response)=>{

    //const {cpf} = request.params; - método utiliza o params para buscar cpf "/statement/:cpf"
    
    const {customer} = request;
    return response.json(customer.statement);

    
})
 
app.post("/deposit", verifyIfExistsAccountCPF, (request, response)=>{

        const {description, amount} = request.body; // são passados dois parâmetros "descriptio e amount"

        const {customer} = request;

       //a variável statementOperation contém os dados a serem inseridos no statement costumer
       const statementOperation = {
           description,
           amount,
           create_at: new Date(),
           type: "credit"
       } 
       customer.statement.push(statementOperation);

       return response.status(201).send();
})


app.post("/withdraw", verifyIfExistsAccountCPF,(request, response)=>{

    const{ amount } = request.body;
    const {customer} = request;
    
    const balance = getBalance(customer.statement);

    if(balance <amount){
        return response.status(400).json({error:"Insuficient funds!"})
    }

    const statementOperation = {
        amount,
        create_ad: new Date(),
        type: "debit",
    };

    customer.statement.push(statementOperation);

    return response.status(201).send();
});




app.get("/statement/date", verifyIfExistsAccountCPF, (request, response)=>{

   
    
    const {customer} = request;
    const {date} = request.query;

        
    const dateFormat = new Date(date + "00:00");

    const statement = customer.statement.filter(
    (statement)=>
    statement.created_at.toDateString() === 
    new Date(dateFormat).toDateString()
    
);
    

    return response.json(statement);

    
})


app.listen(3333, (request, response)=>{
    console.log("Server is running on port 3333")
});











