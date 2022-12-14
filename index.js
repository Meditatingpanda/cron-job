const https = require("https");

const handler = async ({ package, probability }) => {
  const runs = 100 ;
  console.log(`Attempting ${runs} concurrent runs with probability ${probability}`);

  await Promise.all(
    new Array(runs).fill(null).map((_, i) => {
      console.group(`run ${i+1}:`);
      run({ package, probability })
      console.groupEnd()
    })
  )
};
let i=0
const run = async ({ package, probability }) => {
  if (Math.random() > probability) {
    console.log("Roll fail - skipping run");
    return;
  }

  console.log("Roll success!");
  
  try {
    await downloadPackage({ package });
    console.log("Package fetched!",i);
    i++;
  } catch(err) {
    console.error('Package fetch fail');
    console.error(err)
    throw err;
  }
};

const downloadPackage = async ({ package }) => {
  const tarball = await new Promise((resolve, reject) => {
    https
      .get(`https://registry.npmjs.org/${package}`, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          const response = JSON.parse(data);
          const versions = Object.keys(response.versions);
          const tarball =
            response.versions[versions[versions.length - 1]].dist.tarball;
          resolve(tarball);
        });
      })
      .on("error", reject);
  });

  await new Promise((resolve, reject) =>
    https.get(tarball, (res) => {
      res.on("data", () => {});
      res.on("end", resolve);
    }).on("error", reject)
  );
};

handler({ package: "recode-cli", probability: 0.5 });
// setInterval(() => {
//   handler({ package: "recode-cli", probability: 0.5 });
// }, 3000);

