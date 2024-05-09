import { useRouter } from 'next/router';

const DynamicPage = () => {
  const router = useRouter();
  const { id } = router.query;

  return (
    <div>
      <h1>Dynamic Page</h1>
      <p>ID: {id}</p>
    </div>
  );
};

export default DynamicPage;
