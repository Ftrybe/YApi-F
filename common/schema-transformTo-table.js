const _ = require('underscore')

let fieldNum = 1

exports.schemaTransformToTable = schema => {
  try {
    schema = checkJsonSchema(schema)
    let result = Schema(schema, 0)
    result = _.isArray(result) ? result : [result]
    return result
  } catch (err) {
    console.log(err)
  }
}

//  自动添加type

function checkJsonSchema (json) {
  const newJson = Object.assign({}, json)
  if (_.isUndefined(json.type) && _.isObject(json.properties)) {
    newJson.type = 'object'
  }

  return newJson
}

const mapping = function (data, index) {
  switch (data.type) {
    case 'string':
      return SchemaString(data)

    case 'number':
      return SchemaNumber(data)

    case 'array':
      return SchemaArray(data, index)

    case 'object':
      return SchemaObject(data, index)

    case 'boolean':
      return SchemaBoolean(data)

    case 'integer':
      return SchemaInt(data)
    default:
      return SchemaOther(data)
  }
}

const ConcatDesc = (title, desc) => {
  return [title, desc].join('\n').trim();
};

const Schema = (data, key) => {
  const result = mapping(data, key)
  if (data.type !== 'object') {
    const desc = result.desc
    const d = result.default
    const children = result.children

    delete result.desc
    delete result.default
    delete result.children
    let item = {
      type: data.type,
      key,
      desc,
      default: d,
      sub: result,
    }

    if (_.isArray(children)) {
      item = Object.assign({}, item, { children })
    }

    return item
  }

  return result
}

const SchemaObject = (data, key) => {
  let { properties, required } = data
  properties = properties || {}
  required = required || []
  const result = []
  Object.keys(properties).map((name, index) => {
    const value = properties[name]
    const copiedState = checkJsonSchema(JSON.parse(JSON.stringify(value)))

    const optionForm = Schema(copiedState, `${key}-${index}`)
    let item = {
      name,
      key: `${key}-${index}`,
      desc: ConcatDesc(copiedState.title, copiedState.description),
      required: required.indexOf(name) !== -1,
    }

    if (value.type === 'object' || (_.isUndefined(value.type) && _.isArray(optionForm))) {
      item = Object.assign({}, item, { type: 'object', children: optionForm })
      delete item.sub
    } else {
      item = Object.assign({}, item, optionForm)
    }

    result.push(item)
  })
  return result
}

const SchemaString = data => {
  const item = {
    desc: ConcatDesc(copiedState.title, copiedState.description),
    default: data.default,
    maxLength: data.maxLength,
    minLength: data.minLength,
    enum: data.enum,
    enumDesc: data.enumDesc,
    format: data.format,
    mock: data.mock && data.mock.mock,
  }
  return item
}

const SchemaArray = (data, index) => {
  data.items = data.items || { type: 'string' }
  const items = checkJsonSchema(data.items)
  const optionForm = mapping(items, index)
  //  处理array嵌套array的问题
  let children = optionForm
  if (!_.isArray(optionForm) && !_.isUndefined(optionForm)) {
    optionForm.key = `array-${fieldNum++}`
    children = [optionForm]
  }

  let item = {
    desc: ConcatDesc(copiedState.title, copiedState.description),
    default: data.default,
    minItems: data.minItems,
    uniqueItems: data.uniqueItems,
    maxItems: data.maxItems,
    itemType: items.type,
    children,
  }
  if (items.type === 'string') {
    item = Object.assign({}, item, { itemFormat: items.format })
  }
  return item
}

const SchemaNumber = data => {
  const item = {
    desc: ConcatDesc(copiedState.title, copiedState.description),
    maximum: data.maximum,
    minimum: data.minimum,
    default: data.default,
    format: data.format,
    enum: data.enum,
    enumDesc: data.enumDesc,
    mock: data.mock && data.mock.mock,
  }
  return item
}

const SchemaInt = data => {
  const item = {
    desc: ConcatDesc(copiedState.title, copiedState.description),
    maximum: data.maximum,
    minimum: data.minimum,
    default: data.default,
    format: data.format,
    enum: data.enum,
    enumDesc: data.enumDesc,
    mock: data.mock && data.mock.mock,
  }
  return item
}

const SchemaBoolean = data => {
  const item = {
    desc: ConcatDesc(copiedState.title, copiedState.description),
    default: data.default,
    enum: data.enum,
    mock: data.mock && data.mock.mock,
  }
  return item
}

const SchemaOther = data => {
  const item = {
    desc: ConcatDesc(copiedState.title, copiedState.description),
    default: data.default,
    mock: data.mock && data.mock.mock,
  }
  return item
}
