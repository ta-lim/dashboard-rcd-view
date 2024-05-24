export default async function GetAnalyze( category, subCategory=null ) {
  try {
    const res = await fetch(import.meta.env.VITE_HOST + '/' + import.meta.env.VITE_VERSION +'/primary/rcd/analyze?category=' + category + '&subCategory=' + subCategory,
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
