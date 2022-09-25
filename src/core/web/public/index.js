const homeRender = () => {
  const html = `<div class="home">
    <h1>YakumoRan</h1>
    <hr>
    <p>当你看到这个页面，就代表你的机器人已经成功运行起来了</p>
    <p>WARN: 本页面没有权限管理，请勿开放公网访问权限</p>
    <p>GitHub: <a href="https://github.com/iirose-tools/YakumoRan" target="_blank">YakumoRan</a></p>
  </div>`

  document.querySelector('.container').innerHTML = html
}

const storeRender = () => {
  const html = '<p>在写了在写了</p>'

  document.querySelector('.container').innerHTML = html
}

const renderElement = (fid, options) => {
  const { type, id, custom, name, options: opts } = options

  if (['text', 'password', 'input'].includes(type)) {
    return `
    <div class="form-floating mb-3">
      <input type="${type}" class="form-control" id="${fid}-${id}" placeholder="${opts.placeholder || ''}">
      <label for="floatingInput">${name}</label>
    </div>
    `
  } else if (type === 'select') {
    const options = opts.seletions.map(opt => `<option value="${opt.value}">${opt.text}</option>`).join('')

    return `
    <select class="form-select" aria-label="Default select example">
      <option selected disabled>${name}</option>
      ${options}
    </select>`
  } else if (type === 'checkbox') {
    return `
    <div class="form-check">
      <input class="form-check-input" type="checkbox" value="" id="${fid}-${id}">
      <label class="form-check-label" for="${fid}-${id}">
        ${name}
      </label>
    </div>
    `
  } else if (type === 'textarea') {
    return `
    <div class="form-floating mb-3">
      <textarea class="form-control" placeholder="${opts.placeholder || ''}" id="${fid}-${id}" style="height: 100px"></textarea>
      <label for="floatingTextarea2">${name}</label>
    </div>
    `
  } else if (type === 'custom') {
    return custom
  }
}

// eslint-disable-next-line no-unused-vars
const submit = async id => {
  const resp = await fetch(`/form/${id}/config`)
  const data = await resp.json()
  const ids = data.map(form => `${id}-${form.id}`)
  const values = ids.map(id => document.getElementById(id) ? document.getElementById(id).value : '')

  const body = {}

  ids.forEach((id, index) => {
    body[id] = values[index]
  })

  const submit = await fetch(`/form/${id}/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  })

  const result = await submit.json()
  const err = result.err
  if (err) {
    // eslint-disable-next-line no-undef
    alert(err)
  }
}

const render = async id => {
  if (id === 'home') {
    homeRender()
  } else if (id === 'store') {
    storeRender()
  } else {
    const resp = await fetch(`/form/${id}/config`)
    const data = await resp.json()

    const html = data.map(form => renderElement(id, form))
    html.push(`<button type="button" class="btn btn-primary" onclick="submit('${id}')">提交</button>`)

    document.querySelector('.container').innerHTML = html.join('')
  }
}

fetch('/api/core/menu')
  .then(res => res.json())
  .then(data => {
    const html = data.map(item => {
      return `
      <div class="item" data-id="${item.id}">
        <i class="${item.icon}"></i>
        <p>${item.title}</p>
      </div>
      `
    }).join('')

    document.querySelector('#plugins').innerHTML = html

    document.querySelectorAll('.item').forEach(item => {
      item.addEventListener('click', () => {
        document.querySelectorAll('.item').forEach(item => {
          item.classList.remove('active')
        })

        item.classList.add('active')

        const id = item.getAttribute('data-id')
        render(id)
      })
    })
  })
