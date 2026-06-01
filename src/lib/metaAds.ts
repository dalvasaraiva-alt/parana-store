const META_APP_ID = '1315024867422816';
const META_APP_SECRET = 'cd9985031d8afafe259873ddf5bc95b3';
const META_ACCESS_TOKEN = 'EAASsAhYX8mABRodJd5g6skUujQZAtlpjUVylpmyQt75s1jpoQUx2wWcYSrSIdQAt5ubE1WyvouCivg6niBHOVou0mEi99fGxfKZB95djLThYHiaMmlZC5oe3uKjZClz0oy9nLFsbc8GMnGQqG9eFFS2gZB0RP8cZAgd4kyt02qBZCZBacoFgPoErMtpxKjep5tYCNlX8vY94aA5CZCOCl8DD6pirtL1RKXEI2Q9Ta';
const META_AD_ACCOUNT_ID = '952439839782147';

export async function getMetaAdSpend(date: string): Promise<number> {
  try {
    const url = `https://graph.facebook.com/v19.0/act_${META_AD_ACCOUNT_ID}/insights?fields=spend&time_range={"since":"${date}","until":"${date}"}&access_token=${META_ACCESS_TOKEN}`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.data && data.data.length > 0) {
      return parseFloat(data.data[0].spend);
    }
    return 0;
  } catch (error) {
    console.error('Erro ao buscar gastos Meta Ads:', error);
    return 0;
  }
}