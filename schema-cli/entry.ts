import index from './index'

(async function() {
  try {
    await index()
  } catch (e) {
    console.error(e)
  }
})()
