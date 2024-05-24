export default async function createUser( data, auth ){
  const res = await fetch(import.meta.env.VITE_HOST + '/' + import.meta.env.VITE_VERSION + '/primary/auth/create', 
  {
    method: 'POST',
    headers: {
      'Accept': '*/*',
      'Content-Type': 'application/json',
      'Authorization': auth,
    },
    body: JSON.stringify(data)
  }).then((res) => res.json());

  if(res) {
    if(res.status === 200) {
      return {status: "200", data: res.data}
    }
    return {status: res.status, err: res.err, message: res.message}
  }
}