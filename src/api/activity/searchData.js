export default async function searchData( title, category ) {

  let url = `${import.meta.env.VITE_HOST}/${import.meta.env.VITE_VERSION}/primary/rcd/search?title=${title}&category=${category}`;
  try {
    const res = await fetch(url,
      {
        method: "GET",
        headers: {
          Accept: "*/*",
          "Content-Type": "application/json",
          // ...(auth ? { Authorization: auth } : {}),
        },
      }
    )
    .then((res) => res.json());
      if (res.status === 200) {
        return { status: "200", data: res.data };
      }
  } catch {
    return { status: "err" };
  }
}
