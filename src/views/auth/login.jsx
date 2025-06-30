import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { Helmet } from 'react-helmet';
import api from '../../service/api';
import TpkLogo from '../../assets/indocement.png';
import style from './style.module.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

const Login = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const formik = useFormik({
    initialValues: {
      username: "",
      password: "",
    },
    validationSchema: Yup.object({
      username: Yup.string().required("Username tidak valid"),
      password: Yup.string().required("Password harus diisi"),
    }),
    onSubmit: (values) => {
      handleLogin(values);
    },
  });

  const handleLogin = async (values) => {
    setIsLoading(true);
    try {
      const response = await api.post("/User/login", null, {
        params: {
          username: values.username,
          password: values.password,
        },
      });

      if (response.status === 200 && response.data.success) {
        const { userid, username, role, token } = response.data.data;
        localStorage.setItem("token", token);
        localStorage.setItem("userid", userid);
        localStorage.setItem("username", username);
        localStorage.setItem("role", role.join(","));

        const allowedRoles = ["Administrator", "Operator", "Guest"];
        if (allowedRoles.some(r => role.includes(r))) {
          navigate("/dashboard");
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Access Denied',
            text: 'You do not have permission to access this application.',
          });
        }
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Login Failed',
          text: response.data.error || 'Unknown error occurred',
        });
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Unexpected error occurred';
      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  AOS.init();
  AOS.refresh();

  return (
    <>
      <Helmet>
        <title>Indocement Monitoring | Login</title>
      </Helmet>
      <div className={`relative ${style.bgjictbg} bg-cover bg-no-repeat w-full h-screen`}>
        <div className="absolute w-full h-screen"></div>
        <div className="z-10 absolute flex flex-col items-center justify-center m-auto left-0 right-0 top-0 bottom-0 md:h-screen lg:py-0">
          <Card
            data-aos="zoom-in-up"
            data-aos-duration="1000"
            className="w-full bg-white shadow-lg md:mt-0 md:sm:max-w-md"
          >
            <CardHeader className="p-6 pb-4">
              <img
                data-aos="zoom-in-left"
                data-aos-duration="1000"
                className="w-86"
                src={TpkLogo}
                alt="logo"
              />
            </CardHeader>
            <CardContent className="p-6 pt-2">
              <form className="space-y-4 md:space-y-6" onSubmit={formik.handleSubmit}>
                <div className="flex flex-col space-y-2">
                  <Label
                    htmlFor="username"
                    data-aos="zoom-in-right"
                    data-aos-duration="1000"
                  >
                    Username
                  </Label>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="Masukkan Username"
                    className={formik.touched.username && formik.errors.username ? 'border-red-500' : ''}
                    {...formik.getFieldProps("username")}
                  />
                  {formik.touched.username && formik.errors.username && (
                    <div className="text-red-500 text-xs">
                      {formik.errors.username}
                    </div>
                  )}
                </div>

                <div className="flex flex-col space-y-2">
                  <Label
                    htmlFor="password"
                    data-aos="zoom-in-right"
                    data-aos-duration="1000"
                  >
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      className={`pr-10 ${formik.touched.password && formik.errors.password ? 'border-red-500' : ''}`}
                      {...formik.getFieldProps("password")}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {formik.touched.password && formik.errors.password && (
                    <div className="text-red-500 text-xs">
                      {formik.errors.password}
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  data-aos="zoom-in-left"
                  data-aos-duration="1000"
                  className="w-full bg-[#004AAD] hover:bg-[#26ACFA] text-white font-medium rounded-lg text-sm py-2.5"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Loading...
                    </div>
                  ) : (
                    "Login"
                  )}
                </Button>
              </form>

              <div className="mt-6">
                <p className="text-center text-xs">&copy; 2025 Autogate Monitoring System</p>
                <p className="text-center text-xs">All Rights Reserved | PT. Indocement Tbk</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Login;