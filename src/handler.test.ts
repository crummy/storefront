import { tableName } from './order'
import { resetTable } from './testUtil'

describe('create order', () => {
  beforeEach(async () => await resetTable(tableName))
})