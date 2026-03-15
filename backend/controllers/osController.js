const model = require('../models/osModel');

const getAllOS = async (req, res) => {
  try {
    const orders = await model.getAllOS();
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getOSById = async (req, res) => {
  try {
    const order = await model.getOSById(req.params.id);

    if (!order)
      return res.status(404).json({ message: 'OS não encontrada' });

    res.status(200).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createOS = async (req, res) => {
  try {
    const order = await model.createOS(req.body);
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const patchStatusOs = async (req, res) => {
  try{
    const patchedRow = await model.patchStatusOs(req.params.id, req.body.status_os);

    if(!patchedRow){
      return res.status(404).json({message: "Os não encontrado"});
    }
    res.json({message: "Os atualizado com sucesso", data: patchedRow});
  }
  catch (err){
    res.status(500).json({error: err.message});
  }
}

const getPublicOS = async (req,res)=>{

 try{

   const os = await model.getPublicOS(req.params.id)

   if(!os)
     return res.status(404).json({message:"OS não encontrada"})

   res.status(200).json(os)

 }catch(err){

   res.status(500).json({error: err.message})

 }

}

const getValorTotalOS = async (req,res)=>{

 try{

  const data = await model.getValorTotalOs(req.params.id)

  if(!data)
    return res.status(404).json({message:"OS não encontrada"})

  res.json({data})

 }catch(err){

  res.status(500).json({error: err.message})

 }

}

module.exports = {
  getAllOS,
  getOSById,
  createOS,
  patchStatusOs,
  getPublicOS,
  getValorTotalOS
};
