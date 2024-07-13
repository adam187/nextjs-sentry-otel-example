export default function Home({ testProp }) {
  return <div>test {testProp}</div>;
}

Home.getInitialProps = async () => {
  return {
    testProp: "test",
  };
};
