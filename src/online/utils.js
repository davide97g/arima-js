function new_matrix(N, M) {
  let matrix = [];
  for (let i = 0; i < N; i++) {
    let row = [];
    for (let j = 0; j < M; j++) {
      row.push(0);
    }
    matrix.push(row);
  }
  return matrix;
}

function new_vector(N) {
  let vector = [];
  for (let i = 0; i < N; i++) vector.push(0);
  return vector;
}

function new_random_vector(N) {
  let v = [];
  for (let i = 0; i < N; i++) {
    v.push(Math.random() / 10);
  }
  return v;
}

module.exports = {
  new_matrix,
  new_random_vector,
  new_vector,
};
