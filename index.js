/********** GLOABL VARIABLES **********/
const appBodyContainer = document.querySelector("div.parent")
let visible = appBodyContainer.style.display = "none"
const carousel = document.querySelector("#carousel-container > div.carousel-inner")
const login = document.querySelector("#login")
let currentUserId;
const listingImg = document.querySelector('#listing-details > div > img')
const reviewForm = document.querySelector("#create-rating")
const logInput = document.querySelector("#login-form > p > input")
const viewReview = document.querySelector("#review-container > ul")
const viewReservation = document.querySelector('#reservations ul')



/********** LOGO  **********/
const logoBanner = document.querySelector('body > div.banner > img')
logoBanner.src = 'assets/cover.png'

const logoPlacement = document.querySelector('#logo > img')
logoPlacement.src = "assets/main-page-logo.png"



/********** OPENING CAROSEL AND LOGIN  **********/
document.addEventListener("DOMContentLoaded", () => {
    const loginContainer = document.querySelector('div.container')
    const bannerImage = document.querySelector('body > div.banner')

    const body = document.querySelector("body")
    body.addEventListener("click", event => {
        //   hide & seek with the form
        if (event.target.id === "login") {
            const name = logInput.value
            appBodyContainer.style.display = ""
            carousel.style.display = "none"
            loginContainer.style.display = "none"
            bannerImage.style.display = "none"
            renderGuestName(name)
        }
        else if (event.target.className === "logout") {
            appBodyContainer.style.display = "none"
            carousel.style.display = ""
            loginContainer.style.display = ""
            bannerImage.style.display = ""
        }
    })
})

function renderGuestName(name) {
    const userWelcome = document.querySelector('#welcome-banner h2')
    userWelcome.textContent = `Welcome Back, ${name}!`

    fetch('http://localhost:3000/guests')
        .then(resp => resp.json())
        .then(userArr => {
            // userWelcome.textContent = `Welcome Back, ${userArr[0].name}!`
            currentUserId = userArr[0].id
        })
}



/********** SHOWS LISTINGS IN SIDEBAR  **********/
function fetchAllListings() {
    fetch('http://localhost:3000/listings')
        .then(response => response.json())
        .then(listingsArr => {
            listingsArr.forEach(listingObj => {
                renderEachListing(listingObj)
                showListingDetailsHelper(listingsArr[8])
            })
        })
}

function renderEachListing(listingObj) {

    const listingLi = document.createElement('li.item')
    listingLi.dataset.id = listingObj.id
    listingLi.className = "listing-item"

    listingLi.innerText = `
    ${listingObj.name}
    `

    const allListingsContainer = document.querySelector('#side-bar > ul')
    allListingsContainer.append(listingLi)
}


/********** CLICKED LISTING DETAILS  **********/
function showListingDetailsHelper(listingObj) {

    listingImg.src = listingObj.image
    listingImg.alt = listingObj.name
    listingImg.dataset.id = listingObj.id

    const listingLocation = document.querySelector('#listing-details > div > div > h2')
    listingLocation.innerText = listingObj.location

    const listingPrice = document.querySelector("#listing-details > div > div > h3")
    listingPrice.innerText = `$${listingObj.price}/Week`

    const listingDesc = document.querySelector('#listing-details > p.description')
    listingDesc.innerText = `${listingObj.description}`

    const listingMapImage = document.querySelector('#map-container img')
    // listingMapImage.src = listingObj.map_img
    // listingMapImage.alt = listingObj.location

    reviewForm.dataset.id = listingObj.id
    viewReview.dataset.id = listingObj.id

    viewReview.innerHTML = ""
    if (listingObj.reviews) {
        listingObj.reviews.forEach(review => {
            const reviewComment = review.comment
            const reviewRating = review.rating
            const reviewLi = document.createElement('li')
            reviewLi.dataset.id = review.id
            reviewLi.innerText = ` Stars: ${reviewRating}
            Note: ${reviewComment}`
            viewReview.append(reviewLi)

            const deleteButton = document.createElement('button')
            deleteButton.className = 'btn btn-danger'
            deleteButton.innerText = "x"
            viewReview.append(deleteButton)
        })
    }
}

function showListingDetails() {
    const listingContainer = document.querySelector('#side-bar')

    listingContainer.addEventListener('click', event => {
        if (event.target.className === "listing-item") {
            fetch(`http://localhost:3000/listings/${event.target.dataset.id}`)
                .then(resp => resp.json())
                .then(singleListing => {
                    showListingDetailsHelper(singleListing)
                    const listingRes = document.querySelector('#reservations > ul')
                    listingRes.innerHTML = ""
                    singleListing.bookings.forEach(singleBooking => {
                        showBookingsHelper(singleBooking)
                    })
                })
        }
    })
}



/********** REVIEW FORM **********/
function reviewFormFunc() {

    reviewForm.addEventListener('submit', event => {
        event.preventDefault()

        const listingId = event.target.dataset.id

        const newReviewObj = {
            rating: event.target.rating.value,
            comment: event.target.comment.value,
            listing_id: listingId
        }
        console.log(event.target.rate)
        const reviewComment = event.target.comment.value
        const reviewRating = event.target.rating.value
        const reviewLi = document.createElement('li')
        reviewLi.innerText = `${reviewComment}
         Rating: ${reviewRating}`
        viewReview.append(reviewLi)

        const deleteButton = document.createElement('button')
        deleteButton.className='btn btn-danger'
        // deleteButton.className = 'delete-btn'
        deleteButton.innerText = "x"
        viewReview.append(deleteButton)


        reviewForm.reset()
        fetch('http://localhost:3000/reviews', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(newReviewObj)
        })
    })
}




/********** DELETE REVIEW **********/
function viewReviewFunc() {
    viewReview.addEventListener("click", event => {

        if (event.target.className === 'btn btn-danger') {
            const reviewLi = event.target.previousElementSibling
            reviewLi.remove()
            event.target.remove()
            const liId = reviewLi.dataset.id
            fetch(`http://localhost:3000/reviews/${liId}`, {
                method: 'DELETE'
            })
        }
    })
}


/********** RESERVATION FORM **********/
function newBookingForm() {

    const modal = document.querySelector("#modal")
    document.querySelector("#create-booking-button").addEventListener("click", () => {
        modal.style.display = "block"
    })
    const exitButton = document.querySelector('#new-booking-form > input.exit-button')
    exitButton.addEventListener('click', event => {
        modal.style.display = "none"
    })

    // Hide the form
    modal.addEventListener("submit", event => {
        event.preventDefault()
        modal.style.display = "none"

        if (event.target.dataset.action === "close") {
        }

        const listingId = document.querySelector('.listing-img')

        const newBookingObj = {
            checkin: event.target.checkin.value,
            checkout: event.target.checkout.value,
            listing_id: listingId.dataset.id,
            guest_id: currentUserId
        }
        fetch('http://localhost:3000/bookings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(newBookingObj)
        })
        showBookingsHelper(newBookingObj)

        event.target.reset()
    })
}


function showBookingsHelper(newBookingObj) {
    const listingRes = document.querySelector('#reservations > ul')
    const resLi = document.createElement('li.res')
    resLi.dataset.id = newBookingObj.id

    resLi.innerText = `
    Guest: ${newBookingObj.guest_id}
    Check-In Date: 
    ${newBookingObj.checkin}

    Check-Out Date: 
    ${newBookingObj.checkout}`
    listingRes.append(resLi)

    const resDeleteButton = document.createElement('button')
    resDeleteButton.className = 'btn btn-danger'
    // resDeleteButton.className = 'res-delete-btn'
    resDeleteButton.innerText = "Delete"
    listingRes.append(resDeleteButton)

    // const resEditButton = document.createElement('button')
    // resEditButton.className = 'res-edit-btn'
    // resEditButton.innerText = "Edit"
    // listingRes.append(resEditButton)
}




/********** DELETE RESERVATION **********/
function viewReservationFunc() {
    viewReservation.addEventListener("click", event => {

        if (event.target.className === 'btn btn-danger') {
            const resLi = event.target.previousElementSibling
            resLi.remove()
            event.target.remove()
            const resLiId = resLi.dataset.id

            fetch(`http://localhost:3000/bookings/${resLiId}`, {
                method: 'DELETE'
            })
        }
        // else if(event.target.className === 'res-edit-btn') {
        //     const resId = event.target.previousElementSibling.previousElementSibling.dataset.id
        //     editResFormFunc(resId)
        // }
    })
}




/********** EDIT RESERVATION: WORK IN PROGRESS **********/
// Currently working on being able to edit this form. Old info not showing 
// up when Edit button is clicked. Not sure why as 'resId' is pointing to that specific bookings'
// id. And it is also being used in the fetch http request. Also, unable to get CSS working on this
// form for some reason. If you cick edit button once, nothing happens. If clicked again,
// form pops up in the upper right hand corner of the page. It's currently 7:03pm and I'm going 
// to take a break. 


// function editResFormFunc(resId) {
//     // console.log(resId)
//     const editModal = document.querySelector("#edit-modal")
//     document.querySelector(".res-edit-btn").addEventListener("click", () => {
//         editModal.style.display = "block"
//     })
    
//     const exitEditButton = document.querySelector('#edit-modal > input.exit-edit-button')
//     exitEditButton.addEventListener('click', event => {
//         editModal.style.display = "none"
//     })

//     editModal.addEventListener("submit", event => {
//         event.preventDefault()
//         editModal.style.display = "none"
        
//         if (event.target.dataset.action === "close") {
//         }
//         // const editCheckin = document.querySelector('#checkin')
//         // const editCheckout = document.querySelector('#checkout')
//         // const editNote = document.querySelector('#note')
        
//             const checkin = event.target.checkin.value
//             const checkout = event.target.checkout.value
//             const listing_id = resId
//             const guest_id = currentUserId
//             // note: event.target.comment.value
    
//         fetch(`http://localhost:3000/bookings/${resId}`, {
//             method: 'PATCH',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Accept': 'application/json'
//             },
//             body: JSON.stringify({ checkin, checkout, listing_id, guest_id })
//         })
//     })
// }




/********** MAP API: WORKS BUT ONLY STAYS ON ONE SET LOCATION **********/
var marker = new mapboxgl.Marker()
    .setLngLat([30.5, 50.5])
    .addTo(map);

// Set options
var marker = new mapboxgl.Marker({
    draggable: true
}).setLngLat([-74.0083, 40.7077])
    .addTo(map);

// var marker = new mapboxgl.Marker()
//     .setLngLat([-74.0083, 40.7077])
//     .addTo(map); // add the marker to the map


// Store the marker's longitude and latitude coordinates in a variable
// var lngLat = marker.getLngLat();
// Print the marker's longitude and latitude values in the console
// console.log('Longitude: ' + lngLat.lng + ', Latitude: ' + lngLat.lat)





/********** APP INIT **********/
fetchAllListings()
showListingDetails()
newBookingForm()
reviewFormFunc()
viewReviewFunc()
viewReservationFunc()