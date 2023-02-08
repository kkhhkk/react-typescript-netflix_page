export function makeImagePath(backPath: string, format?: string) {
  return `https://image.tmdb.org/t/p/${
    format ? format : "original"
  }/${backPath}`;
}

export function ratingToPercent(score: number) {
  return score * 10;
}
