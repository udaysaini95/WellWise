import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Login from "./components/Login/Login";
import VerifyLogin from "./components/Login/VerifyLogin";
import "./index.css";

import {
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";

import Layout from "./Layout.jsx";
import Home from "./components/Home/Home.jsx";
import About from "./components/About/About.jsx";
import Step1 from "./components/About/Step1.jsx";
import Step2 from "./components/About/Step2.jsx";
import Step3 from './components/About/Step3.jsx';
import Step4 from './components/About/Step4.jsx';
import Step5 from './components/About/Step5.jsx';
import SubmitPage from './components/About/SubmitPage.JSX';
import ResultPage from "./components/Result/Result.jsx";
import { DietFormComponent } from "./components/DietFormComponent/DietFormComponent.jsx";
import WellAI from './components/WellAI/WellAI.jsx';
import { FormProvider } from './context/FormContext.jsx';
import { DietProvider } from './components/DietFormComponent/DietFormComponent.jsx';
import { ExerciseFormComponent, ExerciseProvider } from './components/ExerciseFormComponent/ExerciseFormComponent.jsx';
import LoginPage from './components/LoginPage/Loginpage.jsx';
import SignupPage from './components/LoginPage/SignupPage.jsx';
import HydrationTracker from './components/HydrationTracker/HydrationTracker.jsx';
const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      {/* Main application routes with the standard layout */}
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="About" element={<About />}>
          <Route path="step1" element={<Step1 />} />
          <Route path="step2" element={<Step2 />} />
          <Route path="step3" element={<Step3 />} />
          <Route path="step4" element={<Step4 />} />
          <Route path="step5" element={<Step5 />} />
          <Route path="submit" element={<SubmitPage />} />
        </Route>
        <Route path="diet" element={<DietFormComponent />} />
        <Route path="WellAI" element={<WellAI />} />
        <Route path="exercise" element={<ExerciseFormComponent />} />
        <Route path="/hydration" element={<HydrationTracker />} />
      </Route>

      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/result" element={<ResultPage />} />
    </>
  )
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <FormProvider>
      <DietProvider>
        <ExerciseProvider>
          <RouterProvider router={router} />
        </ExerciseProvider>
      </DietProvider>
    </FormProvider>
  </StrictMode>
);
