import Deliveries from '@/models/Deliveries.model';

const find = async (req) => {
  // some vars
  let query = {};
  let limit = req.body.limit ? (req.body.limit > 100 ? 100 : parseInt(req.body.limit)) : 100;
  let skip = req.body.page ? ((Math.max(0, parseInt(req.body.page)) - 1) * limit) : 0;
  let sort = { _id: 1 }

  // if date provided, filter by date
  if (req.body.when) {
    query['when'] = {
      '$gte': req.body.when
    }
  };

  let totalResults = await Deliveries.find(query).countDocuments();

  if (totalResults < 1) {
    throw {
      code: 404,
      data: {
        message: `We couldn't find any delivery`
      }
    }
  }

  let deliveries = await Deliveries.find(query).skip(skip).sort(sort).limit(limit);

  return {
    totalResults: totalResults,
    deliveries
  }
}

const filter = async (req) => {

  let weight = 0
  let limit = req.body.limit ? (req.body.limit > 100 ? 100 : parseInt(req.body.limit)) : 100;
  let skip = req.body.page ? ((Math.max(0, parseInt(req.body.page)) - 1) * limit) : 0;
  let sort = { _id: 1 }
  weight = parseInt(req.body.weight)

  let totalResults = [];
  totalResults  = await Deliveries.aggregate([
    { $match:  {
      $and: [
             {when: {$gte: new Date( req.body.dateFrom)}},
             {when: {$lte: new Date( req.body.dateTo)}}]
                },
    },
{$lookup:
{
             from: 'products',
             localField: 'products',
             foreignField: '_id',
             as: 'products'
}}
,
{ $match: { 'products.weight': weight  }

   }]).exec();

  totalResults = totalResults.length

  if (totalResults < 1) {
    throw {
      code: 404,
      data: {
        message: `We couldn't find any delivery`
      }
    }
  }

let deliveries = [];
 deliveries = await Deliveries.aggregate([
  { $match:  {
    $and: [
           {when: {$gte: new Date( req.body.dateFrom)}},
           {when: {$lte: new Date( req.body.dateTo)}}]
              },
  },
{$lookup:
{
           from: 'products',
           localField: 'products',
           foreignField: '_id',
           as: 'products'
}}
,
{ $match: { 'products.weight': weight }

 },
 { $skip : skip},
 { $limit : limit},
 { $sort : sort}
]).exec();

  return {
    totalResults: totalResults,
    deliveries
  }
}

const create = async (req) => {
  try {
    await Deliveries.create(req.body);
  } catch (e) {
    throw {
      code: 400,
      data: {
        message: `An error has occurred trying to create the delivery:
          ${JSON.stringify(e, null, 2)}`
      }
    }
  }
}

const findOne = async (req) => {
  let delivery = await Deliveries.findOne({_id: req.body.id});
  if (!delivery) {
    throw {
      code: 404,
      data: {
        message: `We couldn't find a delivery with the sent ID`
      }
    }
  }
  return delivery;
}

export default {
  find,
  filter,
  create,
  findOne
}
