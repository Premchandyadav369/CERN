cmake_minimum_required(VERSION 3.16)
project(cernx_scientific_kernels LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

add_compile_options(-O3 -Wall -Wextra -Werror)

add_executable(l1_trigger_hls l1_trigger_hls.cpp)
add_executable(rk4_track_integrator rk4_track_integrator.cpp)

enable_testing()
add_test(NAME L1TriggerHLSTest COMMAND l1_trigger_hls)
add_test(NAME RK4TrackIntegratorTest COMMAND rk4_track_integrator)
