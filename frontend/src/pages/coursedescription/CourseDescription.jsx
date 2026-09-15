import "./coursedescription.css";
import { useParams, useNavigate } from "react-router-dom";
import { mediaUrl, server } from "../../main";
import axios from "axios";
import toast from "react-hot-toast";
import Loading from "../../components/loading/Loading";
import { useEffect, useState } from "react";
import { CourseData } from "../../context/CourseContext";
import { UserData } from "../../context/UserContext";

const CourseDescription = ({ user }) => {
  const params = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const { fetchUser } = UserData();
  const { fetchCourse, course, fetchCourses } = CourseData();

  //   const checkoutHandler = async () => {
  //     const token = localStorage.getItem("token");
  //     setLoading(true);

  //     const {
  //       data: { order },
  //     } = await axios.post(
  //       `${server}/api/course/checkout/${params.id}`,
  //       {},
  //       {
  //         headers: {
  //           token,
  //         },
  //       },
  //     );

  //     const options = {
  //       key: "rzp_test_SgYLEBjsr1DnWF", // Enter the Key ID generated from the Dashboard
  //       amount: order.id, // Amount is in currency subunits.
  //       currency: "INR",
  //       name: "E-Learning", //your business name
  //       description: "Learn with Us",
  //       order_id: order.id, // This is a sample Order ID. Pass the `id` obtained in the response of Step 1

  //       handler: async function (response) {
  //         const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
  //           response;

  //         try {
  //           const { data } = await axios.post(
  //             `${server}/api/verification/${params.id}`,
  //             {
  //               razorpay_order_id,
  //               razorpay_payment_id,
  //               razorpay_signature,
  //             },
  //             {
  //               headers: {
  //                 token,
  //               },
  //             },
  //           );
  //           await fetchUser();
  //           await fetchCourses();
  //           //await fetchMyCourse();
  //           toast.success(data.message);
  //           setLoading(false);
  //           navigate(`/payment-success/${razorpay_payment_id}`);
  //         } catch (error) {
  //           toast.error(error.response.data.message);
  //           setLoading(false);
  //         }
  //       },
  //       theme: {
  //         color: "#8a4baf",
  //       },
  //     };
  //     //const razorpay = new window.Razorpay(options);
  //     const RazorpayConstructor = window.Razorpay;
  //     const razorpay = new RazorpayConstructor(options);
  //     razorpay.open();
  //   };

  const checkoutHandler = async () => {
    const token = localStorage.getItem("token");
    setLoading(true);

    try {
      const {
        data: { order, keyId },
      } = await axios.post(
        `${server}/api/course/checkout/${params.id}`,
        {},
        { headers: { token } },
      );

      const options = {
        key: keyId,
        amount: order.amount,
        currency: order.currency,
        name: "E-Learning",
        description: "Learn with Us",
        order_id: order.id,

        handler: async function (response) {
          try {
            const { data } = await axios.post(
              `${server}/api/verification/${params.id}`,
              response,
              { headers: { token } },
            );

            await fetchUser();
            await fetchCourses();

            toast.success(data.message);
            setLoading(false);

            navigate(`/payment-success/${response.razorpay_payment_id}`);
          } catch (error) {
            toast.error(error.response?.data?.message || "Payment failed");
            setLoading(false);
          }
        },

        modal: {
          ondismiss: () => setLoading(false),
        },
        theme: { color: "#8a4baf" },
      };

      if (!window.Razorpay) {
        toast.error("Payment checkout is still loading. Please try again.");
        setLoading(false);
        return;
      }

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Unable to start payment",
      );
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourse(params.id);
  }, [fetchCourse, params.id]);

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <>
          {course && (
            <div className="course-description">
              <div className="course-header">
                <img
                  src={mediaUrl(course.image)}
                  alt=""
                  className="course-image"
                />
                <div className="course-info">
                  <h2>{course.title}</h2>
                  <p>Instructor: {course.createdBy}</p>
                  <p>Duration: {course.duration} weeks</p>
                </div>
              </div>
              <p>{course.description}</p>
              <p>Let's get started with course At ₹{course.price}</p>

              {user && user.subscription.includes(course._id) ? (
                <button
                  onClick={() => navigate(`/course/study/${course._id}`)}
                  className="common-btn"
                >
                  Study
                </button>
              ) : (
                <button onClick={checkoutHandler} className="common-btn">
                  Buy Now
                </button>
              )}
            </div>
          )}
        </>
      )}
    </>
  );
};

export default CourseDescription;
