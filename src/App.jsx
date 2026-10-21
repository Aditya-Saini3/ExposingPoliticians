import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import Politicians from './pages/Politicians.jsx';
import Politician from './pages/Politician.jsx';
import Categories from './pages/Categories.jsx';
import Category from './pages/Category.jsx';
import About from './pages/About.jsx';
import Status from './components/Status.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="politicians" element={<Politicians />} />
        <Route path="politician/:id" element={<Politician />} />
        <Route path="categories" element={<Categories />} />
        <Route path="category/:key" element={<Category />} />
        <Route path="about" element={<About />} />
        <Route path="*" element={<Status error="Page not found." />} />
      </Route>
    </Routes>
  );
}
