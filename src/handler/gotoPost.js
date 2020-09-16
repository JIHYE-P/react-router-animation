import { getMoviesDetail } from "../utils"

// () => getPost(args)
export const gotoPost = (id) => async(ev) => {
  const {data: {data: {movie}}} = await getMoviesDetail(id);
  console.log(movie)
}
