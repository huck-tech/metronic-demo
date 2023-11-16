

import {useState, useEffect, useRef} from 'react'
import {Formik, Form, FormikValues} from 'formik'
import * as Yup from 'yup'
import clsx from 'clsx'
import {getUserByToken, register} from '../core/_requests'
import {Link} from 'react-router-dom'
import {Step1} from '../../../modules/wizards/components/steps/Step1'
import {toAbsoluteUrl, KTIcon} from '../../../../_metronic/helpers'
import {PasswordMeterComponent} from '../../../../_metronic/assets/ts/components'
import {StepperComponent} from '../../../../_metronic/assets/ts/components'
import {useAuth} from '../core/Auth'

interface ICreateAccount {
  accountType: string
  firstname: string
  email: string
  lastname: string
  password: string
  changepassword: string
  acceptTerms: boolean
}

const createAccountSchemas = [
  Yup.object({
    accountType: Yup.string().required().label('Account Type'),
  }),
  Yup.object().shape({
    firstname: Yup.string()
      .min(3, 'Minimum 3 symbols')
      .max(50, 'Maximum 50 symbols')
      .required('First name is required'),
    email: Yup.string()
      .email('Wrong email format')
      .min(3, 'Minimum 3 symbols')
      .max(50, 'Maximum 50 symbols')
      .required('Email is required'),
    lastname: Yup.string()
      .min(3, 'Minimum 3 symbols')
      .max(50, 'Maximum 50 symbols')
      .required('Last name is required'),
    password: Yup.string()
      .min(3, 'Minimum 3 symbols')
      .max(50, 'Maximum 50 symbols')
      .required('Password is required'),
    changepassword: Yup.string()
      .min(3, 'Minimum 3 symbols')
      .max(50, 'Maximum 50 symbols')
      .required('Password confirmation is required')
      .oneOf([Yup.ref('password')], "Password and Confirm Password didn't match"),
    acceptTerms: Yup.bool().required('You must accept the terms and conditions'),
  })
]

const initialValues = {
  accountType: '',
  firstname: '',
  lastname: '',
  email: '',
  password: '',
  changepassword: '',
  acceptTerms: false,
}

export function Registration() {
  const [loading, setLoading] = useState(false)
  const {saveAuth, setCurrentUser} = useAuth()
  const stepperRef = useRef<HTMLDivElement | null>(null)
  const [currentSchema, setCurrentSchema] = useState(createAccountSchemas[0])
  const [initValues] = useState<ICreateAccount>(initialValues)
  const [ stepper, setStepper ] = useState<StepperComponent | null>(null)

  const loadStepper = () => {
    setStepper(StepperComponent.createInsance(stepperRef.current as HTMLDivElement))
  }

  useEffect(() => {
    PasswordMeterComponent.bootstrap()
  }, [])

  useEffect(() => {
    if (!stepperRef.current) {
      return
    }

    loadStepper()
  }, [stepperRef])

  const prevStep = () => {
    if (!stepper) {
      return
    }

    stepper.goPrev()

    setCurrentSchema(createAccountSchemas[stepper.currentStepIndex - 1])
  }

  const submitStep = async (values: ICreateAccount, actions: FormikValues) => {
    if (!stepper) {
      return
    }

    if (stepper.currentStepIndex !== 2) {
      stepper.goNext()
      actions.setTouched({})
    } else {
      setLoading(true)
      try {
        const {data: auth} = await register(
          values.email,
          values.firstname,
          values.lastname,
          values.password,
          values.changepassword
        )
        saveAuth(auth)
        const {data: user} = await getUserByToken(auth.api_token)
        setCurrentUser(user)
      } catch (error) {
        console.error(error)
        saveAuth(undefined)
        actions.setStatus('The registration details is incorrect')
        actions.setSubmitting(false)
        setLoading(false)
      }
    }

    console.log(values);

    setCurrentSchema(createAccountSchemas[stepper.currentStepIndex - 1])
  }

  return (
    <div
      ref={stepperRef}
      className='stepper stepper-pills stepper-column d-flex flex-column flex-lg-row flex-column-fluid h-100'
      id='kt_create_account_stepper'
    >
      {/* begin::Body */}
      <div className='d-flex flex-column flex-lg-row-fluid w-lg-50 p-10 order-2'>
        {/* begin::Form */}
        <div className='d-flex flex-center flex-column flex-lg-row-fluid'>
          {/* begin::Wrapper */}
          <div className='p-10'>
            <Formik validationSchema={currentSchema} initialValues={initValues} onSubmit={submitStep}>
              {(formik) => (
                <Form className='py-20 w-100 w-xl-538px' noValidate id='kt_create_account_form'>
                  <div className='current' data-kt-stepper-element='content'>
                    <Step1 />
                  </div>

                  <div data-kt-stepper-element='content'>
                    <div className='w-100'>
                      <div className='text-center mb-11'>
                        <h1 className='text-gray-900 fw-bolder mb-3'>Account Details</h1>

                        <div className='text-gray-500 fw-semibold fs-6'>Add your personal Info</div>
                      </div>
                      <div className='row g-3 mb-9'>
                        <div className='col-md-6'>
                          <a
                            href='#'
                            className='btn btn-flex btn-outline btn-text-gray-700 btn-active-color-primary bg-state-light flex-center text-nowrap w-100'
                          >
                            <img
                              alt='Logo'
                              src={toAbsoluteUrl('media/svg/brand-logos/google-icon.svg')}
                              className='h-15px me-3'
                            />
                            Sign in with Google
                          </a>
                        </div>
                        <div className='col-md-6'>
                          <a
                            href='#'
                            className='btn btn-flex btn-outline btn-text-gray-700 btn-active-color-primary bg-state-light flex-center text-nowrap w-100'
                          >
                            <img
                              alt='Logo'
                              src={toAbsoluteUrl('media/svg/brand-logos/apple-black.svg')}
                              className='theme-light-show h-15px me-3'
                            />
                            <img
                              alt='Logo'
                              src={toAbsoluteUrl('media/svg/brand-logos/apple-black-dark.svg')}
                              className='theme-dark-show h-15px me-3'
                            />
                            Sign in with Apple
                          </a>
                        </div>
                      </div>

                      <div className='separator separator-content my-14'>
                        <span className='w-125px text-gray-500 fw-semibold fs-7'>Or with email</span>
                      </div>

                      <div className="row g-3 mb-8">
                        <div className='fv-row col-md-6'>
                          <input
                            placeholder='First name'
                            type='text'
                            autoComplete='off'
                            {...formik.getFieldProps('firstname')}
                            className={clsx(
                              'form-control bg-transparent',
                              {
                                'is-invalid': formik.touched.firstname && formik.errors.firstname,
                              },
                              {
                                'is-valid': formik.touched.firstname && !formik.errors.firstname,
                              }
                            )}
                          />
                          {formik.touched.firstname && formik.errors.firstname && (
                            <div className='fv-plugins-message-container'>
                              <div className='fv-help-block'>
                                <span role='alert'>{formik.errors.firstname}</span>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className='fv-row col-md-6'>

                          <input
                            placeholder='Last name'
                            type='text'
                            autoComplete='off'
                            {...formik.getFieldProps('lastname')}
                            className={clsx(
                              'form-control bg-transparent',
                              {
                                'is-invalid': formik.touched.lastname && formik.errors.lastname,
                              },
                              {
                                'is-valid': formik.touched.lastname && !formik.errors.lastname,
                              }
                            )}
                          />
                          {formik.touched.lastname && formik.errors.lastname && (
                            <div className='fv-plugins-message-container'>
                              <div className='fv-help-block'>
                                <span role='alert'>{formik.errors.lastname}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className='fv-row mb-8'>
                        <input
                          placeholder='Email'
                          type='email'
                          autoComplete='off'
                          {...formik.getFieldProps('email')}
                          className={clsx(
                            'form-control bg-transparent',
                            {'is-invalid': formik.touched.email && formik.errors.email},
                            {
                              'is-valid': formik.touched.email && !formik.errors.email,
                            }
                          )}
                        />
                        {formik.touched.email && formik.errors.email && (
                          <div className='fv-plugins-message-container'>
                            <div className='fv-help-block'>
                              <span role='alert'>{formik.errors.email}</span>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className='fv-row mb-8' data-kt-password-meter='true'>
                        <div className='mb-1'>
                          <div className='position-relative mb-3'>
                            <input
                              type='password'
                              placeholder='Password'
                              autoComplete='off'
                              {...formik.getFieldProps('password')}
                              className={clsx(
                                'form-control bg-transparent',
                                {
                                  'is-invalid': formik.touched.password && formik.errors.password,
                                },
                                {
                                  'is-valid': formik.touched.password && !formik.errors.password,
                                }
                              )}
                            />
                            {formik.touched.password && formik.errors.password && (
                              <div className='fv-plugins-message-container'>
                                <div className='fv-help-block'>
                                  <span role='alert'>{formik.errors.password}</span>
                                </div>
                              </div>
                            )}
                          </div>
                          <div
                            className='d-flex align-items-center mb-3'
                            data-kt-password-meter-control='highlight'
                          >
                            <div className='flex-grow-1 bg-secondary bg-active-success rounded h-5px me-2'></div>
                            <div className='flex-grow-1 bg-secondary bg-active-success rounded h-5px me-2'></div>
                            <div className='flex-grow-1 bg-secondary bg-active-success rounded h-5px me-2'></div>
                            <div className='flex-grow-1 bg-secondary bg-active-success rounded h-5px'></div>
                          </div>
                        </div>
                        <div className='text-muted'>
                          Use 8 or more characters with a mix of letters, numbers & symbols.
                        </div>
                      </div>
                      <div className='fv-row mb-5'>
                        <input
                          type='password'
                          placeholder='Password confirmation'
                          autoComplete='off'
                          {...formik.getFieldProps('changepassword')}
                          className={clsx(
                            'form-control bg-transparent',
                            {
                              'is-invalid': formik.touched.changepassword && formik.errors.changepassword,
                            },
                            {
                              'is-valid': formik.touched.changepassword && !formik.errors.changepassword,
                            }
                          )}
                        />
                        {formik.touched.changepassword && formik.errors.changepassword && (
                          <div className='fv-plugins-message-container'>
                            <div className='fv-help-block'>
                              <span role='alert'>{formik.errors.changepassword}</span>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className='fv-row mb-8'>
                        <label className='form-check form-check-inline' htmlFor='kt_login_toc_agree'>
                          <input
                            className='form-check-input'
                            type='checkbox'
                            id='kt_login_toc_agree'
                            {...formik.getFieldProps('acceptTerms')}
                          />
                          <span>
                            I Accept the{' '}
                            <a
                              href='https://keenthemes.com/metronic/?page=faq'
                              target='_blank'
                              className='ms-1 link-primary'
                            >
                              Terms
                            </a>
                            .
                          </span>
                        </label>
                        {formik.touched.acceptTerms && formik.errors.acceptTerms && (
                          <div className='fv-plugins-message-container'>
                            <div className='fv-help-block'>
                              <span role='alert'>{formik.errors.acceptTerms}</span>
                            </div>
                          </div>
                        )}
                      </div>
                      {stepper?.currentStepIndex === 2 && (
                        <div className='text-center'>
                          <button
                            type='submit'
                            id='kt_sign_up_submit'
                            className='btn btn-lg btn-primary w-100 mb-5'
                            disabled={formik.isSubmitting || !formik.isValid || !formik.values.acceptTerms}
                          >
                            {!loading && <span className='indicator-label'>Submit</span>}
                            {loading && (
                              <span className='indicator-progress' style={{display: 'block'}}>
                                Please wait...{' '}
                                <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
                              </span>
                            )}
                          </button>
                          <p className="text-gray-500 text-center fw-semibold fs-6">Already have an Account? <Link to="/auth/login">Sign in</Link></p>
                        </div>
                      )}
                    </div>
                  </div>

                  {stepper?.currentStepIndex === 1 && (
                    <div className='d-flex flex-stack pt-10'>
                      <div className='mr-2'>
                        <button
                          onClick={prevStep}
                          type='button'
                          className='btn btn-lg btn-light-primary me-3'
                          data-kt-stepper-action='previous'
                        >
                          <KTIcon iconName='arrow-left' className='fs-4 me-1' />
                          Back
                        </button>
                      </div>

                      <div>
                        <button type='submit' className='btn btn-lg btn-primary me-3'>
                          <span className='indicator-label'>
                            {stepper?.currentStepIndex !== ((stepper?.totalStepsNumber || 2) - 1) && 'Continue'}
                            {stepper?.currentStepIndex === ((stepper?.totalStepsNumber || 2) - 1) && 'Submit'}
                            <KTIcon iconName='arrow-right' className='fs-3 ms-2 me-0' />
                          </span>
                        </button>
                      </div>
                    </div>
                  )}
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>

      {/* begin::Aside */}
      <div
        className='d-flex bgi-size-cover bgi-position-center order-1 aside position-relative'
        style={{backgroundImage: `url(${toAbsoluteUrl('media/misc/auth-bg.png')})`}}
      >
        {/* begin::Content */}
        <div className='d-flex flex-column align-items-center px-5 px-md-15 w-100'>
          {/* begin::Logo */}
          <Link to='/' className='mb-12'>
            <img alt='Logo' src={toAbsoluteUrl('media/logos/custom-1.png')} className='h-75px' />
          </Link>
          {/* end::Logo */}
          <div className='card-body px-6 px-lg-10 px-xxl-15 py-20'>
            {/* begin::Nav*/}
            <div className='stepper-nav'>
              {/* begin::Step 1*/}
              <div className='stepper-item current' data-kt-stepper-element='nav'>
                {/* begin::Wrapper*/}
                <div className='stepper-wrapper'>
                  {/* begin::Icon*/}
                  <div className='stepper-icon w-40px h-40px'>
                    <i className='stepper-check fas fa-check'></i>
                    <span className='stepper-number'>1</span>
                  </div>
                  {/* end::Icon*/}

                  {/* begin::Label*/}
                  <div className='stepper-label'>
                    <h3 className='stepper-title'>Account Type</h3>

                    <div className='stepper-desc fw-semibold'>Setup Your Account Details</div>
                  </div>
                  {/* end::Label*/}
                </div>
                {/* end::Wrapper*/}

                {/* begin::Line*/}
                <div className='stepper-line h-40px'></div>
                {/* end::Line*/}
              </div>
              {/* end::Step 1*/}

              {/* begin::Step 2*/}
              <div className='stepper-item' data-kt-stepper-element='nav'>
                {/* begin::Wrapper*/}
                <div className='stepper-wrapper'>
                  {/* begin::Icon*/}
                  <div className='stepper-icon w-40px h-40px'>
                    <i className='stepper-check fas fa-check'></i>
                    <span className='stepper-number'>2</span>
                  </div>
                  {/* end::Icon*/}

                  {/* begin::Label*/}
                  <div className='stepper-label'>
                    <h3 className='stepper-title'>Personal Info</h3>
                    <div className='stepper-desc fw-semibold'>Setup your personal Info</div>
                  </div>
                  {/* end::Label*/}
                </div>
                {/* end::Wrapper*/}

                {/* begin::Line*/}
                <div className='stepper-line h-40px'></div>
                {/* end::Line*/}
              </div>
              {/* end::Step 2*/}

              {/* begin::Step 3*/}
              <div className='stepper-item' data-kt-stepper-element='nav'>
                {/* begin::Wrapper*/}
                <div className='stepper-wrapper'>
                  {/* begin::Icon*/}
                  <div className='stepper-icon w-40px h-40px'>
                    <i className='stepper-check fas fa-check'></i>
                    <span className='stepper-number'>3</span>
                  </div>
                  {/* end::Icon*/}

                  {/* begin::Label*/}
                  <div className='stepper-label'>
                    <h3 className='stepper-title'>Verification</h3>
                    <div className='stepper-desc fw-semibold'>Verify your account.</div>
                  </div>
                  {/* end::Label*/}
                </div>
                {/* end::Wrapper*/}

                {/* begin::Line*/}
                <div className='stepper-line h-40px'></div>
                {/* end::Line*/}
              </div>
              {/* end::Step 3*/}

              {/* begin::Step 4*/}
              <div className='stepper-item' data-kt-stepper-element='nav'>
                {/* begin::Wrapper*/}
                <div className='stepper-wrapper'>
                  {/* begin::Icon*/}
                  <div className='stepper-icon w-40px h-40px'>
                    <i className='stepper-check fas fa-check'></i>
                    <span className='stepper-number'>4</span>
                  </div>
                  {/* end::Icon*/}

                  {/* begin::Label*/}
                  <div className='stepper-label'>
                    <h3 className='stepper-title'>Creator Info</h3>
                    <div className='stepper-desc fw-semibold'>Setup creator details</div>
                  </div>
                  {/* end::Label*/}
                </div>
                {/* end::Wrapper*/}

                {/* begin::Line*/}
                <div className='stepper-line h-40px'></div>
                {/* end::Line*/}
              </div>
              {/* end::Step 4*/}

              {/* begin::Step 5*/}
              <div className='stepper-item' data-kt-stepper-element='nav'>
                {/* begin::Wrapper*/}
                <div className='stepper-wrapper'>
                  {/* begin::Icon*/}
                  <div className='stepper-icon w-40px h-40px'>
                    <i className='stepper-check fas fa-check'></i>
                    <span className='stepper-number'>5</span>
                  </div>
                  {/* end::Icon*/}

                  {/* begin::Label*/}
                  <div className='stepper-label'>
                    <h3 className='stepper-title'>Completed</h3>
                    <div className='stepper-desc fw-semibold'>Your account is created</div>
                  </div>
                  {/* end::Label*/}
                </div>
                {/* end::Wrapper*/}
              </div>
              {/* end::Step 5*/}
            </div>
            {/* end::Nav*/}
          </div>
        </div>
        {/* end::Content */}
        <div className='d-flex flex-center flex-wrap px-5 position-absolute' style={{ bottom: 35, left: '50%', transform: 'translateX(-50%)' }}>
          <div className='d-flex fw-semibold text-primary fs-base'>
            <a href='#' className='px-5 text-success' target='_blank'>
              Terms
            </a>

            <a href='#' className='px-5 text-success' target='_blank'>
              Plans
            </a>

            <a href='#' className='px-5 text-nowrap text-success' target='_blank'>
              Contact Us
            </a>
          </div>
        </div>
      </div>
      {/* end::Aside */}
    </div>
  )
}
